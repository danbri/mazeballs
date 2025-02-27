#!/usr/bin/env node

/**
 * Simple script to check that network loading is working
 */

const { CTNet } = require("../../src/index.js");
const fs = require('fs');
const path = require('path');
const tf = require('@tensorflow/tfjs');

// Initialize TensorFlow.js
async function setupTensorFlow() {
  // Make sure TensorFlow is ready before proceeding
  await tf.ready();
  console.log("TensorFlow.js initialized with backend:", tf.getBackend());
}

async function main() {
  try {
    // Initialize TensorFlow.js first
    await setupTensorFlow();
    
    const filePath = '../../networks/examples/working_oscillator.json';
    console.log(`Loading network from ${filePath}...`);
    
    // Load network definition
    const fullPath = path.resolve(__dirname, filePath);
    console.log(`Full path: ${fullPath}`);
    const data = fs.readFileSync(fullPath, 'utf8');
    console.log(`Raw data: ${data}`);
    
    const networkDef = JSON.parse(data);
    console.log('Network definition:', networkDef);
    
    // Create network
    console.log("Creating network...");
    const myNet = CTNet(networkDef);
    
    // Check network properties
    console.log("Network properties:");
    console.log(`- Size: ${myNet.size}`);
    console.log(`- Name: ${myNet.name}`);
    console.log(`- Step size: ${myNet.step_size}`);
    console.log(`- Biases: ${myNet.biases ? myNet.biases.arraySync() : 'undefined'}`);
    console.log(`- Weights: ${myNet.weights ? JSON.stringify(myNet.weights.arraySync()) : 'undefined'}`);
    console.log(`- Initial states: ${myNet.states ? myNet.states.arraySync() : 'undefined'}`);
    
    console.log("\nDirect network setup test:");
    
    // Try direct setup without JSON
    const directNet = CTNet({
      size: 2,
      init_weights: [
        [4.5, 1.0],
        [-1.0, 4.5]
      ],
      init_states: [0.1, 0.5],
      init_biases: [-2.75, -1.75],
      init_taus: [1, 1],
      step_size: 0.2,
      name: "Direct setup oscillator"
    });
    
    console.log(`- Size: ${directNet.size}`);
    console.log(`- Name: ${directNet.name}`);
    console.log(`- Step size: ${directNet.step_size}`);
    console.log(`- Biases: ${directNet.biases ? directNet.biases.arraySync() : 'undefined'}`);
    
  } catch (error) {
    console.error("Error:", error);
  }
}

main();