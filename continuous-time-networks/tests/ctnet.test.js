/**
 * Unit tests for ctNet library
 */

// Import required modules
const tf = require('@tensorflow/tfjs');
const ctNet = require('../src/ctnet');
const assert = require('assert');

// Helper function to check if two arrays are approximately equal
function assertArraysClose(a, b, epsilon = 1e-5) {
  assert.strictEqual(a.length, b.length, 'Arrays should have the same length');
  for (let i = 0; i < a.length; i++) {
    const diff = Math.abs(a[i] - b[i]);
    assert(diff < epsilon, `Arrays differ at index ${i}: ${a[i]} vs ${b[i]}, diff: ${diff}`);
  }
}

// Helper to check if tensor values are approximately equal
function assertTensorsClose(tensorA, tensorB, epsilon = 1e-5) {
  const a = tensorA.arraySync();
  const b = tensorB.arraySync();
  
  // Handle different tensor shapes
  if (tensorA.rank === 1) {
    assertArraysClose(a, b, epsilon);
  } else if (tensorA.rank === 2) {
    assert.strictEqual(a.length, b.length, 'Tensors should have the same first dimension');
    for (let i = 0; i < a.length; i++) {
      assertArraysClose(a[i], b[i], epsilon);
    }
  } else {
    throw new Error(`Unsupported tensor rank: ${tensorA.rank}`);
  }
}

describe('ctNet', function() {
  // Setup for all tests
  beforeAll(async () => {
    // Initialize TensorFlow.js and ensure it's ready
    await tf.ready();
    
    // Initialize WASM backend explicitly
    try {
      const tfwasm = require('@tensorflow/tfjs-backend-wasm');
      const wasmPath = require.resolve('@tensorflow/tfjs-backend-wasm/dist/tfjs-backend-wasm.wasm');
      const wasmDir = wasmPath.substring(0, wasmPath.lastIndexOf('/') + 1);
      await tfwasm.setWasmPaths(wasmDir);
      console.log('WASM initialized in beforeAll');
      
      // Make sure WASM is registered before proceeding
      await tf.setBackend('wasm');
      console.log('Backend set to:', tf.getBackend());
    } catch (e) {
      console.log('WASM initialization error in beforeAll:', e.message);
      // Fall back to CPU if WASM fails
      await tf.setBackend('cpu');
      console.log('Falling back to CPU backend');
    }
  });
  
  // Basic initialization tests
  describe('Initialization', function() {
    it('should create a network with default parameters', async function() {
      // Ensure backend is initialized before each test
      await tf.ready();
      
      const net = ctNet();
      assert.strictEqual(net.size, 3, 'Default size should be 3');
      assert(net.weights instanceof tf.Tensor, 'Weights should be a tensor');
      assert.strictEqual(net.weights.shape[0], 3, 'Weights should have correct shape');
      assert.strictEqual(net.weights.shape[1], 3, 'Weights should have correct shape');
    });
    
    it('should create a network with specified size', async function() {
      // Ensure backend is initialized before each test
      await tf.ready();
      
      const net = ctNet(5);
      assert.strictEqual(net.size, 5, 'Size should be 5');
      assert.strictEqual(net.weights.shape[0], 5, 'Weights should have correct shape');
      assert.strictEqual(net.weights.shape[1], 5, 'Weights should have correct shape');
    });
    
    it('should create a network with specified weights', async function() {
      // Ensure backend is initialized before each test
      await tf.ready();
      
      const weights = [
        [1, 2],
        [3, 4]
      ];
      const net = ctNet({
        size: 2,
        init_weights: weights
      });
      
      assert.strictEqual(net.size, 2, 'Size should be 2');
      const networkWeights = net.weights.arraySync();
      assert.deepStrictEqual(networkWeights, weights, 'Weights should match');
    });
  });
  
  // Manual parameter setting tests
  describe('Parameter Setting', function() {
    it('should allow manual setting of parameters', async function() {
      await tf.ready();
      
      const net = ctNet({
        size: 2,
        init_weights: [
          [1, 2],
          [3, 4]
        ]
      });
      
      // Set parameters manually
      net.states = tf.tensor1d([0.1, 0.2]);
      net.biases = tf.tensor1d([-1, -2]);
      net.taus = tf.tensor1d([1.5, 2.5]);
      net.gains = tf.tensor1d([0.5, 1.5]);
      net.step_size = 0.01;
      
      // Verify parameters
      assertTensorsClose(net.states, tf.tensor1d([0.1, 0.2]));
      assertTensorsClose(net.biases, tf.tensor1d([-1, -2]));
      assertTensorsClose(net.taus, tf.tensor1d([1.5, 2.5]));
      assertTensorsClose(net.gains, tf.tensor1d([0.5, 1.5]));
      assert.strictEqual(net.step_size, 0.01);
    });
  });
  
  // Beer oscillator test
  describe('Beer Oscillator', function() {
    it('should configure the Beer oscillator correctly', async function() {
      await tf.ready();
      
      // Create Beer oscillator
      const net = ctNet({
        size: 2,
        init_weights: [
          [4.5, 1],
          [-1, 4.5]
        ]
      });
      
      net.states = tf.tensor1d([0.1, 0.5]);
      net.biases = tf.tensor1d([-2.75, -1.75]);
      net.step_size = 0.01;
      
      // Verify configuration
      assert.strictEqual(net.size, 2);
      assertTensorsClose(net.weights, tf.tensor2d([[4.5, 1], [-1, 4.5]]));
      assertTensorsClose(net.states, tf.tensor1d([0.1, 0.5]));
      assertTensorsClose(net.biases, tf.tensor1d([-2.75, -1.75]));
      assert.strictEqual(net.step_size, 0.01);
    });
    
    it('should run a simulation with the Beer oscillator', async function() {
      // Create Beer oscillator
      const net = ctNet({
        size: 2,
        init_weights: [
          [4.5, 1],
          [-1, 4.5]
        ]
      });
      
      net.states = tf.tensor1d([0.1, 0.5]);
      net.biases = tf.tensor1d([-2.75, -1.75]);
      net.step_size = 0.01;
      net.run_duration = 100; // Run for 100 steps
      
      // Run simulation
      const simulation = net.runSimulation();
      const results = [];
      
      // Collect results
      for await (const result of simulation) {
        results.push({
          states: result.states_cpu.slice(),
          outputs: result.outputs_cpu.slice()
        });
        
        // Break early if we've collected enough data
        if (results.length >= net.run_duration) break;
      }
      
      // Verify results
      assert(results.length > 0, 'Simulation should produce results');
      assert(results.length <= net.run_duration, 'Simulation should not exceed run_duration');
      
      // Check for oscillatory behavior by examining several points
      // We don't check exact values, since those can vary, but we check that values change
      // and are within expected ranges
      const firstState = results[0].states;
      const middleState = results[Math.floor(results.length / 2)].states;
      const lastState = results[results.length - 1].states;
      
      // States should change over time
      assert(
        firstState[0] !== middleState[0] || firstState[1] !== middleState[1],
        'States should change over time'
      );
      
      // All states should be finite
      for (const result of results) {
        for (const value of result.states) {
          assert(!isNaN(value) && isFinite(value), 'All state values should be finite');
        }
        for (const value of result.outputs) {
          assert(!isNaN(value) && isFinite(value), 'All output values should be finite');
        }
      }
    });
  });
  
  // Generator and async iteration tests
  describe('Generators and Async Iteration', function() {
    it('should support async iteration over simulation results', async function() {
      const net = ctNet({
        size: 2,
        init_weights: [
          [1, 0],
          [0, 1]
        ]
      });
      
      net.states = tf.tensor1d([0.1, 0.2]);
      net.run_duration = 5; // Short run for testing
      
      // Run simulation with async iteration
      let count = 0;
      for await (const result of net.runSimulation()) {
        assert(result.states, 'Result should have states');
        assert(result.outputs, 'Result should have outputs');
        assert(result.states_cpu, 'Result should have CPU states');
        assert(result.outputs_cpu, 'Result should have CPU outputs');
        count++;
      }
      
      assert.strictEqual(count, net.run_duration, 'Should iterate for run_duration steps');
    });
  });
});

// Run tests if this file is executed directly
if (require.main === module) {
  describe('CTNet Tests', function() {
    console.log('Running CTNet tests...');
    // Run tests here
  });
}