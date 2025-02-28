/**
 * Demonstration of the correct TensorFlow.js initialization pattern
 */

// Import TensorFlow.js first
const tf = require('@tensorflow/tfjs');

async function main() {
  console.log("Starting initialization...");
  
  // 1. Initialize TensorFlow.js FIRST
  await tf.ready();
  
  // 2. Initialize WASM backend EXPLICITLY
  try {
    const tfwasm = require('@tensorflow/tfjs-backend-wasm');
    const wasmPath = require.resolve('@tensorflow/tfjs-backend-wasm/dist/tfjs-backend-wasm.wasm');
    const wasmDir = wasmPath.substring(0, wasmPath.lastIndexOf('/') + 1);
    await tfwasm.setWasmPaths(wasmDir);
    
    // Set WASM as active backend
    await tf.setBackend('wasm');
    console.log("Using WASM backend");
  } catch (e) {
    // Fall back to CPU
    await tf.setBackend('cpu');
    console.log("Falling back to CPU backend:", e.message);
  }
  
  // 3. Import library AFTER TensorFlow.js is fully initialized
  const { CTNet } = require('../../src/index');
  
  // 4. Create and configure the network
  const net = CTNet({
    size: 2,
    init_weights: [
      [4.5, 1],
      [-1, 4.5]
    ]
  });
  
  net.states = tf.tensor1d([0.1, 0.5]);
  net.biases = tf.tensor1d([-2.75, -1.75]);
  net.step_size = 0.01;
  net.run_duration = 100;
  
  console.log("Network configured with backend:", tf.getBackend());
  
  // Run simulation
  console.log("Running simulation...");
  let stepCount = 0;
  
  for await (const result of net.runSimulation()) {
    stepCount++;
    if (stepCount % 10 === 0) {
      console.log(`Step ${stepCount}: Outputs =`, result.outputs_cpu);
    }
    if (stepCount >= 50) break;
  }
  
  console.log("Simulation completed successfully\!");
}

main().catch(error => console.error("ERROR:", error));
