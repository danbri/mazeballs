/**
 * WASM Backend Verification Utility
 * 
 * This script checks if the WebAssembly (WASM) backend for TensorFlow.js
 * is properly installed and functioning.
 * 
 * Run this with: npm run test:wasm
 */

const tf = require('@tensorflow/tfjs');
const path = require('path');
const fs = require('fs');

console.log('╭───────────────────────────────────────────────╮');
console.log('│    CTNet WASM Backend Verification Utility    │');
console.log('╰───────────────────────────────────────────────╯\n');

// Step 1: Check if WASM package is installed
let tfwasm;
try {
  tfwasm = require('@tensorflow/tfjs-backend-wasm');
  console.log('✓ @tensorflow/tfjs-backend-wasm package is installed');
} catch (e) {
  console.log('✗ @tensorflow/tfjs-backend-wasm package is NOT installed');
  console.log('\nTo fix this, run:');
  console.log('  npm install @tensorflow/tfjs-backend-wasm --save');
  process.exit(1);
}

// Step 2: Find WASM binary

let wasmPath;
try {
  // Try to find the WASM file
  const possiblePaths = [
    path.join(__dirname, '..', 'node_modules', '@tensorflow', 'tfjs-backend-wasm', 'dist', 'tfjs-backend-wasm.wasm'),
    path.join(__dirname, '..', '..', 'node_modules', '@tensorflow', 'tfjs-backend-wasm', 'dist', 'tfjs-backend-wasm.wasm')
  ];
  
  for (const testPath of possiblePaths) {
    if (fs.existsSync(testPath)) {
      wasmPath = testPath;
      console.log('✓ WASM binary found at:', wasmPath);
      break;
    }
  }
} catch (e) {
  console.log('✗ Error while searching for WASM binary:', e.message);
}

if (!wasmPath) {
  console.log('✗ WASM binary not found');
  console.log('\nTo fix this, try reinstalling the package:');
  console.log('  npm install @tensorflow/tfjs-backend-wasm --save');
  process.exit(1);
}

// Extract directory
const wasmDir = wasmPath.substring(0, wasmPath.lastIndexOf(path.sep) + 1);

// Initialize WASM and run tests
async function init() {
  try {
    // Step 3: Set WASM paths
    await tfwasm.setWasmPaths(wasmDir);
    console.log('✓ WASM paths set successfully');
    
    // Step 4: Verify backend is registered
    const registeredBackends = Object.keys(tf.engine().registryFactory);
    if (registeredBackends.includes('wasm')) {
      console.log('✓ WASM backend is registered');
    } else {
      console.log('✗ WASM backend is NOT registered');
      process.exit(1);
    }
    
    // Step 5: Try to set WASM backend
    await tf.setBackend('wasm');
    if (tf.getBackend() === 'wasm') {
      console.log('✓ WASM backend is set as active');
    } else {
      console.log('✗ Failed to set WASM backend as active');
      console.log(`  Current backend: ${tf.getBackend()}`);
      process.exit(1);
    }
    
    // Step 6: Run a simple test
    try {
      const t1 = tf.tensor1d([1, 2, 3]);
      const t2 = tf.tensor1d([4, 5, 6]);
      const result = t1.add(t2);
      const resultArray = result.arraySync();
      console.log('✓ Tensor operation test: PASS');
      console.log(`  [1,2,3] + [4,5,6] = [${resultArray}]`);
    } catch (e) {
      console.log('✗ Tensor operation test: FAIL');
      console.log(`  Error: ${e.message}`);
      process.exit(1);
    }
    
    // Success!
    console.log('\n╭───────────────────────────────────────────────╮');
    console.log('│    ✓ WASM BACKEND IS WORKING CORRECTLY! ✓    │');
    console.log('╰───────────────────────────────────────────────╯');
    
    // Performance note
    console.log('\nPerformance Note:');
    console.log('WASM backend provides better performance than CPU backend');
    console.log('and works in both Node.js and browser environments.');
    
  } catch (e) {
    console.log('✗ Error during WASM initialization:');
    console.log(`  ${e.message}`);
    process.exit(1);
  }
}

// Run initialization
init();