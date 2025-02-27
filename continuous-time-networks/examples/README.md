# CTNet Examples

This directory contains examples demonstrating how to use the CTNet library for various tasks and in different environments.

## Browser Examples

The `browser` directory contains examples for using CTNet in web browsers:

- `basic-oscillator.html`: A minimal example showing how to create and run a two-node oscillator.
- `network-loader.html`: Example demonstrating how to load network definitions from JSON files.

## Node.js Examples

The `node` directory contains examples for using CTNet in Node.js applications:

- `basic-oscillator.js`: A basic example showing how to create and run a two-node oscillator in Node.js.
- `direct-oscillator.js`: A more direct approach to creating oscillators with visualization in the terminal.

## Running Examples

### Browser Examples

Browser examples can be opened directly in a web browser. For best results, serve them from a local web server:

```bash
# From the project root directory
npx serve .
```

Then navigate to the examples in your browser (e.g., http://localhost:5000/examples/browser/network-loader.html).

### Node.js Examples

Node.js examples can be run using the `node` command:

```bash
# From the project root directory
node examples/node/basic-oscillator.js
```

## Note on TensorFlow.js Backends

The examples are configured to work with various TensorFlow.js backends (CPU, WebGL, WASM). For best performance, the WASM backend is recommended and is set up automatically when available.