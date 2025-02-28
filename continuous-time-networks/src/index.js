/**
 * Continuous-Time Networks Library
 * 
 * A library for simulating continuous-time dynamical networks
 * with support for multiple computation backends.
 * 
 * @license Apache-2.0
 */

// Import core module (backends are now integrated into ctNet)
const ctNet = require('./ctNet');

// Create a simplified backends API for backward compatibility
const backends = {
  // Method to check available backends
  getRegisteredBackends: function() {
    return Object.keys(require('@tensorflow/tfjs').engine().registryFactory);
  },
  
  // Method to check current backend
  getCurrentBackend: function() {
    return require('@tensorflow/tfjs').getBackend();
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