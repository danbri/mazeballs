const ctNet = require("../../src/ctNet.js");
const tf = require("@tensorflow/tfjs");

const net = ctNet({
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

(async () => {
  for await (const result of net.runSimulation()) {
    console.log(result);
  }
})();

