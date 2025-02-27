#!/usr/bin/env node

/**
 * Direct oscillator setup with manual parameter setting
 */

const ctNet = require('../ctnet-library/src/ctNet');
const fs = require('fs');
const path = require('path');
const tf = require('@tensorflow/tfjs');

// Set up WASM backend (if not already available)
async function setupWasmBackend() {
  try {
    // Check if WASM backend is already registered
    if (!Object.keys(tf.engine().registryFactory).includes('wasm')) {
      console.log("WASM backend not found, attempting to register it...");
      
      // For Node.js, we need to import the WASM backend specifically
      // This is a dynamic import to avoid errors if the package is not installed
      try {
        const tfwasm = await import('@tensorflow/tfjs-backend-wasm');
        await tfwasm.setWasmPaths(
          'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm/dist/'
        );
        console.log("WASM backend registered successfully");
      } catch (e) {
        console.error("Failed to load WASM backend:", e.message);
        console.log("You may need to install @tensorflow/tfjs-backend-wasm");
      }
    }
  } catch (e) {
    console.error("Error setting up WASM backend:", e);
  }
}

// Set up TensorFlow.js backend with preference order: WebGL > WASM > CPU
async function setupTensorFlowBackend(preferredBackend = null) {
  // Try to set up WASM backend first
  await setupWasmBackend();
  
  // Get available backends
  const backends = Object.keys(tf.engine().registryFactory);
  console.log("Available TensorFlow.js backends:", backends.join(", "));
  
  let selectedBackend = 'cpu'; // Default fallback
  
  // If a preferred backend is specified and available, use it
  if (preferredBackend && backends.includes(preferredBackend)) {
    selectedBackend = preferredBackend;
  } 
  // Otherwise use our default preference order
  else if (backends.includes('webgl')) {
    selectedBackend = 'webgl';
  } else if (backends.includes('wasm')) {
    selectedBackend = 'wasm';
  }
  
  // Set the selected backend
  try {
    await tf.setBackend(selectedBackend);
    console.log(`Using ${selectedBackend} backend`);
  } catch (e) {
    console.error(`Failed to set ${selectedBackend} backend:`, e);
    console.log("Falling back to CPU backend");
    await tf.setBackend('cpu');
  }
  
  console.log("Active backend:", tf.getBackend());
  return tf.getBackend();
}

// Define sparkify function for creating sparklines
const sparkify = pc => '▁▂▃▄▅▆▇█'.split('')[Math.floor((pc / 12.5))];

// Color formatting for terminal
const colors = {
  reset: "\x1b[0m",
  blue: "\x1b[34m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m"
};

const colorMap = [colors.blue, colors.red, colors.green, colors.yellow];

// Utility functions
const delay = ms => new Promise(res => setTimeout(res, ms));
const clearScreen = () => process.stdout.write('\x1Bc');

async function main() {
  try {
    // Parse command line arguments for backend preference
    const args = process.argv.slice(2);
    let preferredBackend = null;
    
    if (args.length > 0) {
      // Look for --backend=X argument
      const backendArg = args.find(arg => arg.startsWith('--backend='));
      if (backendArg) {
        preferredBackend = backendArg.split('=')[1].trim();
        console.log(`Backend preference from command line: ${preferredBackend}`);
      }
    }
    
    console.log("Setting up TensorFlow backend...");
    const activeBackend = await setupTensorFlowBackend(preferredBackend);
    
    console.log("\nCreating oscillator network manually...");
    
    // Create network with basic parameters
    const myNet = ctNet({
      size: 2,
      init_weights: [
        [4.5, 1],
        [-1, 4.5]
      ]
    });
    
    // Manually set the parameters that aren't handled by the constructor
    myNet.states = tf.tensor1d([0.1, 0.5]);
    myNet.biases = tf.tensor1d([-2.75, -1.75]);
    myNet.step_size = 0.2;
    myNet.run_duration = 1000;
    myNet.name = "Manual oscillator";
    
    console.log("Network created.");
    console.log("- Name:", myNet.name);
    console.log("- Size:", myNet.size);
    console.log("- Step size:", myNet.step_size);
    console.log("- Biases:", myNet.biases.arraySync());
    console.log("- Initial states:", myNet.states.arraySync());
    console.log("- TensorFlow backend:", tf.getBackend());
    
    console.log("\nRunning simulation...");
    
    // Run simulation
    const simulation = await myNet.runSimulation();
    
    // Collect data
    const nodeData = [[], []];
    let count = 0;
    
    for await (const state of simulation) {
      if (count++ >= 1000) break;
      
      const values = state.outputs_cpu;
      nodeData[0].push(values[0]);
      nodeData[1].push(values[1]);
    }
    
    console.log(`Collected ${nodeData[0].length} data points.`);
    console.log("Sample values (node 0):", nodeData[0].slice(0, 5));
    console.log("Sample values (node 1):", nodeData[1].slice(0, 5));
    
    // Animation
    const displayWidth = process.stdout.columns ? process.stdout.columns - 20 : 80;
    
    console.log(`\nStarting animation with display width ${displayWidth}...`);
    await delay(1000);
    
    // Animation loop
    for (let frame = 0; frame < 300; frame++) {
      clearScreen();
      console.log("OSCILLATOR VISUALIZATION\n");
      
      // Calculate window for visualization
      const windowStart = Math.min(frame, nodeData[0].length - displayWidth);
      const windowEnd = windowStart + displayWidth;
      
      // For each node
      for (let i = 0; i < 2; i++) {
        // Get window of data
        const windowData = nodeData[i].slice(windowStart, windowEnd);
        
        // Convert to sparklines
        const sparkline = windowData.map(v => sparkify(v * 100)).join('');
        
        // Current value
        const currentValue = windowData.length > 0 ? windowData[windowData.length - 1] : 0;
        
        // Display
        const label = `Node ${i}: `;
        console.log(label + colorMap[i] + sparkline + colors.reset + ` [${currentValue.toFixed(3)}]`);
      }
      
      console.log(`\nFrame: ${frame} | Window: ${windowStart}-${windowEnd} | Press Ctrl+C to exit`);
      
      await delay(50);
    }
    
  } catch (error) {
    console.error("Error:", error);
  }
}

main();