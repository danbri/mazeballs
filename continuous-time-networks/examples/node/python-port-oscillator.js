#!/usr/bin/env node

/**
 * Python CTRNN oscillator port to JavaScript using ctNet
 * This is a direct port of the Python code that used matplotlib
 * We'll use node-canvas for rendering in Node.js
 */

const fs = require('fs');
// Note: You'll need to install the canvas package with: npm install canvas
// If canvas is not available, we'll use a text-based visualization
let canvas;
try {
  const { createCanvas } = require('canvas');
  canvas = { createCanvas };
} catch (e) {
  console.log("Canvas package not installed. Will use text-based visualization.");
  canvas = null;
}

const ctNet = require('../ctnet-library/src/ctNet');
const tf = require('@tensorflow/tfjs');

// Parameters (matching the Python code)
const run_duration = 250;
const net_size = 2;
const step_size = 0.01;

async function main() {
  try {
    console.log("Creating oscillator network from Python port...");
    
    // Set up network (matching Python structure)
    const network = ctNet({
      size: net_size,
      init_weights: [
        [4.5, 1],
        [-1, 4.5]
      ]
    });
    
    // Configure network parameters (second step of initialization)
    network.taus = tf.tensor1d([1.0, 1.0]);
    network.biases = tf.tensor1d([-2.75, -1.75]);
    network.step_size = step_size;
    network.run_duration = Math.floor(run_duration / step_size);
    
    // Initialize network with random outputs (matching Python's randomize_outputs)
    const randomValues = [
      Math.random() * 0.1 + 0.1, // Random between 0.1 and 0.2
      Math.random() * 0.1 + 0.1  // Random between 0.1 and 0.2
    ];
    network.states = tf.tensor1d(randomValues);
    
    console.log("Network created with parameters:");
    console.log("- Duration:", run_duration);
    console.log("- Step size:", step_size);
    console.log("- Biases:", network.biases.arraySync());
    console.log("- Initial states:", network.states.arraySync());
    
    // Simulate network and collect outputs
    console.log("Running simulation...");
    const outputs = [[], []]; // Store outputs for each node
    const timepoints = []; // Store timepoints for plotting
    
    let currentTime = 0;
    const simulation = network.runSimulation();
    
    // Collect simulation data
    for await (const state of simulation) {
      // Store outputs
      outputs[0].push(state.outputs_cpu[0]);
      outputs[1].push(state.outputs_cpu[1]);
      
      // Store timepoint
      timepoints.push(currentTime);
      currentTime += step_size;
      
      if (currentTime >= run_duration) break;
    }
    
    console.log(`Collected ${outputs[0].length} data points over ${currentTime.toFixed(2)} time units`);
    
    if (canvas) {
      // Create canvas for plotting (equivalent to matplotlib)
      const canvasWidth = 800;
      const canvasHeight = 500;
      const canvasInstance = canvas.createCanvas(canvasWidth, canvasHeight);
      const ctx = canvasInstance.getContext('2d');
      
      // Setup plot area with white background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      
      // Calculate plot margins
      const margin = { top: 50, right: 50, bottom: 50, left: 50 };
      const plotWidth = canvasWidth - margin.left - margin.right;
      const plotHeight = canvasHeight - margin.top - margin.bottom;
      
      // Draw axes
      ctx.beginPath();
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 1;
      ctx.moveTo(margin.left, margin.top);
      ctx.lineTo(margin.left, canvasHeight - margin.bottom);
      ctx.lineTo(canvasWidth - margin.right, canvasHeight - margin.bottom);
      ctx.stroke();
      
      // Add labels (equivalent to plt.xlabel and plt.ylabel)
      ctx.fillStyle = 'black';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Time', canvasWidth / 2, canvasHeight - 15);
      
      ctx.save();
      ctx.translate(15, canvasHeight / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = 'center';
      ctx.fillText('Neuron outputs', 0, 0);
      ctx.restore();
      
      // Scale data to fit plot area
      const maxTime = run_duration;
      const maxOutput = Math.max(
        ...outputs[0].map(v => Math.abs(v)),
        ...outputs[1].map(v => Math.abs(v))
      ) * 1.1; // Add 10% margin
      
      // Function to convert data points to canvas coordinates
      const timeToX = t => margin.left + (t / maxTime) * plotWidth;
      const outputToY = o => (canvasHeight - margin.bottom) - ((o + maxOutput) / (2 * maxOutput)) * plotHeight;
      
      // Plot neuron 0 outputs (similar to plt.plot)
      ctx.beginPath();
      ctx.strokeStyle = 'blue';
      ctx.lineWidth = 2;
      
      timepoints.forEach((t, i) => {
        const x = timeToX(t);
        const y = outputToY(outputs[0][i]);
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
      
      // Plot neuron 1 outputs
      ctx.beginPath();
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 2;
      
      timepoints.forEach((t, i) => {
        const x = timeToX(t);
        const y = outputToY(outputs[1][i]);
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
      
      // Add legend
      ctx.fillStyle = 'white';
      ctx.fillRect(canvasWidth - 120, margin.top, 100, 60);
      ctx.strokeStyle = 'black';
      ctx.strokeRect(canvasWidth - 120, margin.top, 100, 60);
      
      // Legend lines
      ctx.beginPath();
      ctx.strokeStyle = 'blue';
      ctx.lineWidth = 2;
      ctx.moveTo(canvasWidth - 110, margin.top + 20);
      ctx.lineTo(canvasWidth - 80, margin.top + 20);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 2;
      ctx.moveTo(canvasWidth - 110, margin.top + 40);
      ctx.lineTo(canvasWidth - 80, margin.top + 40);
      ctx.stroke();
      
      // Legend text
      ctx.fillStyle = 'black';
      ctx.font = '12px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('Neuron 0', canvasWidth - 75, margin.top + 24);
      ctx.fillText('Neuron 1', canvasWidth - 75, margin.top + 44);
      
      // Add title (similar to plt.title)
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('CTRNN Oscillator Output', canvasWidth / 2, 25);
      
      // Save the plot to a PNG file
      const buffer = canvasInstance.toBuffer('image/png');
      fs.writeFileSync('oscillator-output.png', buffer);
      
      console.log("Plot saved to oscillator-output.png");
    } else {
      // Create text-based visualization using ASCII art
      console.log("\nText-based visualization of oscillator output:");
      console.log("==============================================");
      
      // Generate ASCII plot with 50 columns and 20 rows
      const plotWidth = 50;
      const plotHeight = 20;
      const plot = Array(plotHeight).fill().map(() => Array(plotWidth).fill(' '));
      
      // Calculate step size based on data points and plot width
      const dataStep = Math.max(1, Math.floor(timepoints.length / plotWidth));
      
      // Fill plot array with points
      for (let col = 0; col < plotWidth; col++) {
        const dataIndex = col * dataStep;
        if (dataIndex < outputs[0].length) {
          // Scale output value to plot height (invert so higher values are at the top)
          const row0 = Math.floor((1 - outputs[0][dataIndex]) * (plotHeight - 1));
          const row1 = Math.floor((1 - outputs[1][dataIndex]) * (plotHeight - 1));
          
          // Clamp values to plot bounds
          const clampedRow0 = Math.max(0, Math.min(plotHeight - 1, row0));
          const clampedRow1 = Math.max(0, Math.min(plotHeight - 1, row1));
          
          // Set characters in plot
          plot[clampedRow0][col] = '1'; // Neuron 0
          plot[clampedRow1][col] = '2'; // Neuron 1
          
          // If both neurons have the same value, show overlap
          if (clampedRow0 === clampedRow1) {
            plot[clampedRow0][col] = 'X';
          }
        }
      }
      
      // Print the ASCII plot
      for (let row = 0; row < plotHeight; row++) {
        console.log(plot[row].join(''));
      }
      
      console.log("==============================================");
      console.log("1: Neuron 0, 2: Neuron 1, X: Both neurons");
      
      // Save data to CSV file for external plotting
      const csvRows = ['time,neuron0,neuron1'];
      for (let i = 0; i < timepoints.length; i++) {
        csvRows.push(`${timepoints[i]},${outputs[0][i]},${outputs[1][i]}`);
      }
      fs.writeFileSync('oscillator-output.csv', csvRows.join('\n'));
      console.log("Data saved to oscillator-output.csv for external plotting");
    }
    
    // Calculate and display some statistics
    const mean0 = outputs[0].reduce((sum, val) => sum + val, 0) / outputs[0].length;
    const mean1 = outputs[1].reduce((sum, val) => sum + val, 0) / outputs[1].length;
    
    console.log("\nSimulation Statistics:");
    console.log(`- Neuron 0 mean output: ${mean0.toFixed(4)}`);
    console.log(`- Neuron 1 mean output: ${mean1.toFixed(4)}`);
    console.log(`- Total timepoints: ${timepoints.length}`);
    console.log(`- Oscillation period: ~${detectPeriod(outputs[0]).toFixed(2)} time units`);
    
  } catch (error) {
    console.error("Error:", error);
  }
}

// Function to detect approximate oscillation period
function detectPeriod(signal) {
  // Find zero crossings
  const crossings = [];
  for (let i = 1; i < signal.length; i++) {
    if ((signal[i-1] < 0.5 && signal[i] >= 0.5) || 
        (signal[i-1] >= 0.5 && signal[i] < 0.5)) {
      crossings.push(i);
    }
  }
  
  // Calculate average distance between crossings (full period is two crossings)
  if (crossings.length <= 1) return 0;
  
  let sumDiffs = 0;
  for (let i = 2; i < crossings.length; i += 2) {
    sumDiffs += crossings[i] - crossings[i-2];
  }
  
  const avgDiff = sumDiffs / Math.floor(crossings.length / 2);
  return avgDiff * 0.01; // Convert steps to time units
}

// Run the main function
main();