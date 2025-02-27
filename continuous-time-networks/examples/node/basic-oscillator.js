const { CTNet } = require("../../src/index.js");
const tf = require("@tensorflow/tfjs");

// Initialize TensorFlow.js first
async function main() {
  // Wait for TensorFlow to be ready
  await tf.ready();
  console.log("TensorFlow.js initialized with backend:", tf.getBackend());

  const net = CTNet({
    size: 2,
    init_weights: [
      [4.5, 1],
      [-1, 4.5]
    ]
  });

  net.states = tf.tensor1d([2, 3]);
  net.biases = tf.tensor1d([-2.75, -1.75]);

  net.run_duration = 1000;
  net.step_size = 1;
  net.name = "Simple 2-Node oscillator.";

  for await (const result of net.runSimulation()) {
    console.log(result);
  }
}

// Run the main function
main().catch(err => {
  console.error("Error:", err);
});

