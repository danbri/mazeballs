# Continuous-Time Networks Library

A JavaScript library for simulating continuous-time dynamical networks, with support for browser and Node.js environments. 
This library implements CTRNNs (Continuous-Time Recurrent Neural Networks) with TensorFlow.js for fast simulation.

## Features

- Fast simulation of continuous-time networks using TensorFlow.js
- Support for multiple computation backends (CPU, WebGL, WASM)
- Browser and Node.js compatibility
- Async generator-based API for streaming simulation results
- Built-in oscillator examples
- Comprehensive testing across environments

## Status

This library is experimental and in active development. It's published to npm as an alpha version.

## Installation

The package is available on npm with an experimental tag:

```bash
# Install the experimental version globally
npm install -g @mazeballs/ctnet-experimental

# Or install in a project
npm install @mazeballs/ctnet-experimental --save-dev
```

Alternatively, you can install directly from the repository:

```bash
git clone https://github.com/danbri/mazeballs.git
cd mazeballs/continuous-time-networks
npm install
```

## Quick Start

### Node.js
```javascript
// Import CTNet
const { CTNet } = require('@mazeballs/ctnet-experimental');

// TensorFlow.js is needed 
const tf = require('@tensorflow/tfjs');

// Create a two-node oscillator
const net = CTNet({
  size: 2,
  init_weights: [
    [4.5, 1],
    [-1, 4.5]
  ]
});

// Configure the network (two-step initialization)
net.states = tf.tensor1d([0.1, 0.5]);
net.biases = tf.tensor1d([-2.75, -1.75]);
net.step_size = 0.01;
net.run_duration = 1000;

// Run simulation using async generator
(async () => {
  for await (const result of net.runSimulation()) {
    console.log(result.outputs_cpu);
    // Access result.states, result.outputs, result.yprime
  }
})();
```

### Browser
```html
<script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs"></script>
<script src="dist/ctnet.js"></script>
<script>
  // Create a basic oscillator
  const net = CTNet({
    size: 2,
    init_weights: [
      [4.5, 1],
      [-1, 4.5]
    ]
  });
  
  // Configure the network
  net.states = tf.tensor1d([0.1, 0.5]);
  net.biases = tf.tensor1d([-2.75, -1.75]);
  net.step_size = 0.01;
  net.run_duration = 1000;
  
  // Run simulation asynchronously
  async function runSimulation() {
    for await (const result of net.runSimulation()) {
      console.log(result.outputs_cpu);
    }
  }
  
  runSimulation();
</script>
```

## Two-Step Initialization Pattern

This library uses a deliberate two-step initialization process:

1. Create the network with initial configuration (weights, size)
2. Manually set other parameters after initialization

```javascript
// Step 1: Create network with basic structure
const myNet = CTNet({
  size: 2,
  init_weights: [
    [4.5, 1],
    [-1, 4.5]
  ]
});

// Step 2: Configure runtime parameters
myNet.states = tf.tensor1d([0.1, 0.5]);
myNet.biases = tf.tensor1d([-2.75, -1.75]);
myNet.step_size = 0.01;
myNet.run_duration = 1000;
```

## Examples

See the [examples](./examples) directory for more detailed usage examples:
- Node.js examples in [examples/node](./examples/node)
- Browser examples in [examples/browser](./examples/browser)

## Demos

Interactive demonstrations are available in the [demos](./demos) directory.

## TensorFlow.js Backends

This library supports multiple TensorFlow.js computation backends:

- WebGL (default in browser environments)
- WASM (WebAssembly - good cross-platform performance)
- CPU (always available)
- WebGPU (experimental, requires browser support)

You can select a backend using:

```javascript
// Import the backends utility
const { backends } = require('@mazeballs/ctnet-experimental');

// Set the best backend based on preference order
await backends.setBestAvailableBackend(['webgl', 'wasm', 'cpu']);

// Check which backends are available
const availableBackends = backends.getRegisteredBackends();
console.log(availableBackends);

// Check if WASM is available (recommended for best performance)
const wasmAvailable = backends.isWasmInitialized();
console.log('WASM backend available:', wasmAvailable);

// Initialize WASM backend silently (no console errors)
const success = await backends.initializeWasm(true);
```

To verify WASM is working correctly, run the built-in utility:

```bash
npm run test:wasm
```

## License

Apache License 2.0
