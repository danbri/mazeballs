#!/usr/bin/env node

/* 
 * Terminal visualization for Continuous Time Networks
 * This script demonstrates the use of terminal-sparklines to visualize
 * CTNet activity in a terminal environment
 */

const ctNet = require('../ctnet-library/src/ctNet');
const { generateSparklines, displaySparklines, animateSparklines, INK } = require('../ctnet-library/src/terminal-sparklines');

// Try to load chalk for terminal colors if available
let chalk;
try {
  chalk = require('chalk');
} catch (e) {
  console.log("Chalk not installed. Running without colors.");
  chalk = null;
}

async function main() {
  console.log("CTNet Terminal Visualization");
  
  // Create a 2-node oscillator network (Beer, 1995 parameters)
  const net = ctNet({
    size: 2,
    init_weights: [
      [4.5, 1],
      [-1, 4.5]
    ],
    init_states: [2, 3],
    init_biases: [-2.75, -1.75],
    name: "Simple 2-Node oscillator."
  });
  
  console.log(`Network: ${net.name} (${net.size} nodes)`);
  
  // Run a simulation for 100 timesteps
  const simulation = await net.runSimulation(net, { run_duration: 100 });
  
  // Generate sparklines from the simulation
  const sparklines = await generateSparklines(net, simulation, { steps: 100 });
  
  // Display static sparklines
  console.log("\nStatic Visualization:");
  
  // Use chalk for colors if available
  const colorize = chalk ? 
    (text, idx) => {
      const colors = [chalk.blue, chalk.red, chalk.green, chalk.yellow];
      return colors[idx % colors.length](text);
    } : null;
  
  // Display with colors if available
  if (colorize) {
    for (let i = 0; i < net.size; i++) {
      console.log(`[${i}]: ${colorize(sparklines[i].join(''), i)}`);
    }
  } else {
    displaySparklines(sparklines, net);
  }
  
  console.log("\nPress Ctrl+C to exit or wait 3 seconds for animated visualization...");
  
  // Wait a moment before starting animation
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Create animated visualization (will run until Ctrl+C)
  await animateSparklines(sparklines, net, {
    delay: 100,
    frames: 200,
    colorizer: colorize ? 
      (text) => chalk.bgBlack(text) : 
      null
  });
}

main().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});