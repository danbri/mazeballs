/**
 * Demo that follows exact WASM initialization pattern from ctnet.test.js
 */

// Import required modules in the same order as the tests
const tf = require('@tensorflow/tfjs');
// DO NOT import the library yet - do it after WASM initialization

// Main function to ensure everything is properly async
async function main() {
  try {
    console.log("Starting initialization...");
    
    // FIRST: Initialize TensorFlow.js (exactly like the tests)
    await tf.ready();
    
    // SECOND: Initialize WASM backend explicitly (exactly like the tests)
    try {
      const tfwasm = require('@tensorflow/tfjs-backend-wasm');
      console.log("WASM backend package loaded");
      
      const wasmPath = require.resolve('@tensorflow/tfjs-backend-wasm/dist/tfjs-backend-wasm.wasm');
      const wasmDir = wasmPath.substring(0, wasmPath.lastIndexOf('/') + 1);
      await tfwasm.setWasmPaths(wasmDir);
      console.log("WASM paths set to:", wasmDir);
      
      // Make sure WASM is registered before proceeding
      await tf.setBackend('wasm');
      console.log("Backend set to:", tf.getBackend());
    } catch (e) {
      console.log("WASM initialization error:", e.message);
      // Fall back to CPU if WASM fails
      await tf.setBackend('cpu');
      console.log("Falling back to CPU backend");
    }
    
    // THIRD: Import our library AFTER TensorFlow.js is fully initialized
    console.log("Importing library...");
    const ctNet = require('@mazeballs/ctnet').CTNet;
    console.log("Library imported successfully");
    
    // FOURTH: Create the network (now everything should be properly initialized)
    console.log("Creating network...");
    const net = ctNet({
      size: 2,
      init_weights: [
        [4.5, 1],
        [-1, 4.5]
      ]
    });
    
    // Configure the network parameters
    net.states = tf.tensor1d([0.1, 0.5]);
    net.biases = tf.tensor1d([-2.75, -1.75]);
    net.step_size = 0.01;
    net.run_duration = 100;
    
    console.log("Network configuration complete");
    console.log("- Size:", net.size);
    console.log("- Step size:", net.step_size);
    console.log("- Current backend:", tf.getBackend());
    
    // Run simulation and collect results
    console.log("\nRunning simulation...");
    let steps = 0;
    
    for await (const result of net.runSimulation()) {
      steps++;
      
      if (steps % 10 === 0) {
        console.log(`Step ${steps}: Outputs =`, result.outputs_cpu);
      }
      
      if (steps >= 50) break;
    }
    
    console.log("Simulation completed successfully\!");
    
  } catch (error) {
    console.error("Error in simulation:", error);
    console.error("Error details:", error.stack);
    if (tf) {
      console.error("Current backend:", tf.getBackend());
      console.error("Available backends:", Object.keys(tf.engine().registryFactory));
    }
  }
}

// Run the main function
main();
