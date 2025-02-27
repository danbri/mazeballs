# CTNet Library Tests

This directory contains tests for the CTNet library, which implements continuous-time recurrent neural networks (CTRNNs) in JavaScript.

## Running Tests

To run the tests:

```bash
npm test
```

## Test Structure

The tests are organized as follows:

- `ctNet.test.js`: Tests for the core CTNet functionality, including:
  - Basic initialization
  - Parameter setting
  - Beer oscillator configuration
  - Simulation execution
  - Generator/async iteration behavior

## Adding New Tests

When adding new tests, please follow these guidelines:

1. Create a new test file for distinct components or features
2. Use descriptive test names that explain what's being tested
3. Keep tests focused on a single aspect of functionality
4. Follow the existing pattern of using `describe` and `it` blocks

## Test Helpers

The tests include helper functions for:

- Comparing arrays with approximate equality (`assertArraysClose`)
- Comparing tensors with approximate equality (`assertTensorsClose`)

## Future Test Directions

Future test development should focus on:

1. Testing more complex network configurations
2. Testing integration with Observable
3. Performance benchmarking
4. Testing the library in browser environments
5. Testing different TensorFlow.js backends (CPU, WebGL, WASM)