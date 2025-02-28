/**
 * Continuous-Time Networks Library
 * 
 * A library for simulating continuous-time dynamical networks
 * with support for multiple computation backends.
 * 
 * @license Apache-2.0
 */

// Import core module and helpers
const ctNet = require('./ctnet'); // Will be bundled by rollup
const tf = require('@tensorflow/tfjs'); // External dependency, not bundled

// Create a simplified backends API for backward compatibility
const backends = {
  // Method to check available backends
  getRegisteredBackends: function() {
    return Object.keys(tf.engine().registryFactory);
  },
  
  // Method to check current backend
  getCurrentBackend: function() {
    return tf.getBackend();
  },
  
  // Method to set backend preferences
  setBestAvailableBackend: function(preferenceOrder) {
    return ctNet.setupBackends(preferenceOrder);
  }
};

// Re-export everything
module.exports = {
  CTNet: ctNet,
  backends
};