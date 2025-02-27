/**
 * Continuous-Time Networks Library
 * 
 * A library for simulating continuous-time dynamical networks
 * with support for multiple computation backends.
 * 
 * @license Apache-2.0
 */

// Import core modules
const ctNet = require('./ctNet');
const backends = require('./backends');

// Re-export everything
module.exports = {
  CTNet: ctNet,
  backends
};