#!/usr/bin/env node

/**
 * Terminal-based visualization with sparklines for Continuous Time Networks
 * Based on the simple-node-demo.js implementation in the js/ directory
 */

const ctNet = require('../ctnet-library/src/ctNet');
const fs = require('fs');
const path = require('path');

// Define sparkify function for creating sparklines
const sparkify = pc => '▁▂▃▄▅▆▇█'.split('')[Math.floor((pc / 12.5))];

// Color formatting for terminal
const colors = {
  reset: "\x1b[0m",
  blue: "\x1b[34m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m"
};

const colorMap = [colors.blue, colors.red, colors.green, colors.yellow, colors.cyan, colors.magenta];

// Parse command line arguments
const args = process.argv.slice(2);
let netDefPath = '../examples/netdefs/working_oscillator.json';
let steps = 1000;
let frameDelay = 50;
let displayWidth = 80; // Default display width

// Process arguments
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--net' && i + 1 < args.length) {
    netDefPath = args[i + 1];
    i++;
  } else if (args[i] === '--steps' && i + 1 < args.length) {
    steps = parseInt(args[i + 1], 10);
    i++;
  } else if (args[i] === '--delay' && i + 1 < args.length) {
    frameDelay = parseInt(args[i + 1], 10);
    i++;
  } else if (args[i] === '--width' && i + 1 < args.length) {
    displayWidth = parseInt(args[i + 1], 10);
    i++;
  } else if (args[i] === '--list') {
    // List available networks
    const netdefsDir = path.resolve(__dirname, '../examples/netdefs');
    const files = fs.readdirSync(netdefsDir);
    console.log("Available network definitions:");
    files.forEach(file => {
      if (file.endsWith('.json')) {
        try {
          const data = fs.readFileSync(path.join(netdefsDir, file), 'utf8');
          const netDef = JSON.parse(data);
          console.log(`- ${file}: ${netDef.name} (${netDef.size} nodes)`);
        } catch (e) {
          console.log(`- ${file}: Error reading file`);
        }
      }
    });
    process.exit(0);
  } else if (args[i] === '--help') {
    console.log(`
Usage: node term-sparklines.js [options]

Options:
  --net PATH      Path to network definition JSON file (default: ../examples/netdefs/oscillatory_2node.json)
  --steps NUM     Number of simulation steps (default: 100)
  --delay NUM     Animation frame delay in ms (default: 100)
  --width NUM     Display width for sparklines (default: 80)
  --list          List available network definitions
  --help          Show this help message

Examples:
  node term-sparklines.js --net ../examples/netdefs/oscillatory_4node.json --steps 200
  node term-sparklines.js --delay 50 --width 60
  node term-sparklines.js --list
`);
    process.exit(0);
  }
}

// Utility functions
const delay = ms => new Promise(res => setTimeout(res, ms));
const clearScreen = () => process.stdout.write('\x1Bc');

// Get terminal size if available
try {
  const { columns } = process.stdout;
  if (columns && columns > 20) {
    displayWidth = columns - 20; // Leave space for labels
  }
} catch (e) {
  // Stick with default width if terminal size can't be determined
}

async function loadNetworkDefinition(filePath) {
  try {
    const fullPath = path.resolve(__dirname, filePath);
    const data = fs.readFileSync(fullPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error loading network definition from ${filePath}:`, error.message);
    process.exit(1);
  }
}

async function main() {
  try {
    console.log("Loading network definition...");
    const networkDef = await loadNetworkDefinition(netDefPath);
    
    console.log("Creating continuous time network...");
    const myNet = ctNet(networkDef);
    console.log(`Created network with size=${myNet.size}, name="${myNet.name}"`);
    
    console.log(`\nRunning simulation for ${steps} steps...`);
    
    // Run simulation
    const simulation = await myNet.runSimulation(myNet, { run_duration: steps });
    
    // Store all activations (limited to actual number of steps)
    const allActivations = Array(myNet.size).fill().map(() => []);
    
    // Collect data from simulation
    for await (const netstate of simulation) {
      const activations = await netstate.outputs.array();
      
      // Store activations for visualization
      activations.forEach((value, index) => {
        allActivations[index].push(value);
      });
    }
    
    console.log("\nSimulation complete! Preparing visualization...");
    console.log(`Network: ${myNet.name} (${myNet.size} nodes)`);
    console.log(`Step size: ${myNet.step_size || 0.1}, Biases: [${myNet.biases.arraySync().join(', ')}]`);
    console.log(`Display width: ${displayWidth} characters`);
    console.log("\nStarting animation (press Ctrl+C to exit)...");
    await delay(1000);
    
    // Create fixed-size display buffer for each node
    // This avoids the growing buffer problem
    const displayBuffers = allActivations.map(nodeData => {
      // If we have more data than display width, use a sliding window
      if (nodeData.length > displayWidth) {
        return nodeData.slice(0, displayWidth);
      } 
      // If we have less data than display width, pad with 0's
      else if (nodeData.length < displayWidth) {
        return [...nodeData, ...Array(displayWidth - nodeData.length).fill(0)];
      }
      // If exactly display width, use as is
      return [...nodeData];
    });
    
    // Animation state
    let offset = 0;
    const maxOffset = Math.max(...allActivations.map(a => a.length));
    
    // Animation loop - run until user interrupts
    for (let frame = 0; frame < 10000 && offset < maxOffset; frame++) {
      clearScreen();
      console.log("CONTINUOUS TIME NETWORK VISUALIZATION\n");
      console.log(`Network: ${myNet.name} (${myNet.size} nodes)`);
      console.log(`Frame: ${frame} | Offset: ${offset} | Data points: ${maxOffset}\n`);
      
      // Display each node's data
      for (let nodeIdx = 0; nodeIdx < myNet.size; nodeIdx++) {
        const nodeData = allActivations[nodeIdx];
        
        // Get the correct window of data based on current offset
        let windowData;
        if (nodeData.length <= displayWidth) {
          // If data is shorter than display, show all of it
          windowData = nodeData;
        } else {
          // Create a sliding window based on the current offset
          const startIdx = Math.min(offset, nodeData.length - displayWidth);
          windowData = nodeData.slice(startIdx, startIdx + displayWidth);
        }
        
        // Convert to sparklines
        // Scale values from [0,1] to [0,100] and add debug info
        const sparkline = windowData.map(v => {
          const scaledValue = Math.min(100, Math.max(0, v * 100));
          return sparkify(scaledValue);
        }).join('');
        
        // Add a small numerical display of current value for debugging
        const currentValue = windowData.length > 0 ? windowData[windowData.length - 1] : 0;
        
        // Display with color - adding value info
        const label = `Node ${nodeIdx}: `;
        console.log(label + colorMap[nodeIdx % colorMap.length] + sparkline + colors.reset + ` [${currentValue.toFixed(3)}]`);
      }
      
      console.log(`\nPress Ctrl+C to exit | Frame: ${frame} | Delay: ${frameDelay}ms`);
      
      // Advance the offset for sliding window effect
      if (maxOffset > displayWidth) {
        offset = Math.min(offset + 1, maxOffset - displayWidth);
      }
      
      // Wait for next frame
      await delay(frameDelay);
    }
    
    console.log("\nAnimation complete!");
    
  } catch (error) {
    console.error("Error occurred:", error);
    process.exit(1);
  }
}

main().catch(err => {
  console.error("Uncaught error:", err);
  process.exit(1);
});