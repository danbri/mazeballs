#!/usr/bin/env node

/**
 * Script to load and run a network from a JSON definition file
 */

const fs = require('fs');
const path = require('path');
const ctNet = require('../ctnet-library/src/ctNet');

// Handle command line args
const args = process.argv.slice(2);
let netdefPath = '../examples/netdefs/netdef_2c.json';
let steps = 10;

if (args.length > 0) {
  netdefPath = args[0];
}

if (args.length > 1) {
  steps = parseInt(args[1], 10);
}

if (args.includes('--help')) {
  console.log(`
Usage: node load-netdef.js [netdef_path] [steps]

Arguments:
  netdef_path   Path to network definition JSON file (default: ../examples/netdefs/netdef_2c.json)
  steps         Number of simulation steps to run (default: 10)

Example:
  node load-netdef.js ../examples/netdefs/netdef_4b.json 20
  `);
  process.exit(0);
}

// Load and run the network
async function main() {
  try {
    // Load network definition
    const fullPath = path.resolve(__dirname, netdefPath);
    console.log(`Loading network definition from ${fullPath}`);
    const networkDef = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    
    // Create network
    const net = ctNet(networkDef);
    console.log(`Created network: "${net.name}" with ${net.size} nodes`);
    console.log(`Network properties:`);
    console.log(`- Weights: ${net.weights.arraySync().map(row => '[' + row.join(', ') + ']').join('\n            ')}`);
    console.log(`- Biases: [${net.biases.arraySync().join(', ')}]`);
    console.log(`- Taus: [${net.taus.arraySync().join(', ')}]`);
    console.log(`- Initial states: [${net.states.arraySync().join(', ')}]`);
    
    // Run simulation
    console.log(`\nRunning simulation for ${steps} steps...`);
    const simulation = await net.runSimulation(net, { run_duration: steps });
    
    // Collect and display results
    let stepCount = 0;
    console.log('\nSimulation results:');
    console.log('Step | Node Values');
    console.log('-----|------------');
    
    for await (const state of simulation) {
      const nodeValues = state.outputs_cpu;
      console.log(`${String(stepCount).padStart(4)} | [${nodeValues.map(v => v.toFixed(6)).join(', ')}]`);
      stepCount++;
    }
    
    console.log('\nSimulation complete.');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();