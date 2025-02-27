/**
 * TensorFlow.js backend utility for CTNet library
 * 
 * This module provides utilities for working with different TensorFlow.js backends
 * (CPU, WebGL, WASM, WebGPU) in the CTNet library.
 */

// In both Node.js and browser environments, we need to access TensorFlow
const tf = typeof module !== "undefined" && module.exports 
  ? require("@tensorflow/tfjs") 
  : window.tf;

// Try to load the WASM backend by default, but do it silently
let wasmBackendInitialized = false;

// Try to load WASM backend without logging errors
try {
  // In Node.js environment
  if (typeof module !== "undefined" && module.exports) {
    // Try to require WASM backend
    try {
      const tfwasm = require('@tensorflow/tfjs-backend-wasm');
      wasmBackendInitialized = true;
      
      // Try to set up paths
      const path = require('path');
      const fs = require('fs');
      
      try {
        // Find WASM file path
        let wasmPath;
        try {
          wasmPath = require.resolve('@tensorflow/tfjs-backend-wasm/dist/tfjs-backend-wasm.wasm');
        } catch (e) {
          // If resolve fails, check common locations
          const basePath = path.join(__dirname, '..', 'node_modules', '@tensorflow', 'tfjs-backend-wasm', 'dist');
          if (fs.existsSync(path.join(basePath, 'tfjs-backend-wasm.wasm'))) {
            wasmPath = path.join(basePath, 'tfjs-backend-wasm.wasm');
          }
        }
        
        // Initialize WASM with path if found
        if (wasmPath) {
          const wasmDir = wasmPath.substring(0, wasmPath.lastIndexOf(path.sep) + 1);
          tfwasm.setWasmPaths(wasmDir);
        }
      } catch (e) {
        // Silently handle path issues
      }
    } catch (e) {
      // Silently handle require failure
    }
  }
  // In browser environments, the script should be included separately
}
catch (e) {
  // Silence any errors
}

/**
 * Get a list of all available TensorFlow.js backends
 * 
 * @returns {string[]} Array of available backend names
 */
function getRegisteredBackends() {
  return Object.keys(tf.engine().registryFactory);
}

/**
 * Check if a specific backend is registered
 * 
 * @param {string} backendName - Name of the backend to check
 * @returns {boolean} True if the backend is registered
 */
function isBackendRegistered(backendName) {
  return getRegisteredBackends().includes(backendName);
}

/**
 * Check if a backend is available (registered and can be set active)
 * 
 * @param {string} backendName - Name of the backend to check
 * @returns {Promise<boolean>} Promise resolving to true if backend is available
 */
async function isBackendAvailable(backendName) {
  if (!isBackendRegistered(backendName)) {
    return false;
  }
  
  try {
    // Store current backend
    const originalBackend = tf.getBackend();
    
    // Try setting the backend
    await tf.setBackend(backendName);
    const success = tf.getBackend() === backendName;
    
    // Restore original backend
    if (originalBackend && originalBackend !== backendName) {
      await tf.setBackend(originalBackend);
    }
    
    return success;
  } catch (e) {
    console.error(`Error checking backend ${backendName}:`, e);
    return false;
  }
}

/**
 * Set the best available backend according to preference order
 * 
 * @param {string[]} preferenceOrder - Array of backend names in order of preference
 * @returns {Promise<string>} Name of the backend that was set
 */
async function setBestAvailableBackend(preferenceOrder = ['webgpu', 'webgl', 'wasm', 'cpu']) {
  // Try backends in order of preference
  for (const backendName of preferenceOrder) {
    if (await isBackendAvailable(backendName)) {
      await tf.setBackend(backendName);
      return backendName;
    }
  }
  
  // If no preferred backend is available, use CPU (always available)
  await tf.setBackend('cpu');
  return 'cpu';
}

/**
 * Try to load a backend if it's not already available
 * 
 * @param {string} backendName - Name of the backend to load
 * @param {boolean} silent - Whether to suppress console warnings
 * @returns {Promise<boolean>} Promise resolving to true if backend was loaded or already available
 */
async function loadBackend(backendName, silent = false) {
  // If backend is already registered, just return true
  if (isBackendRegistered(backendName)) {
    return true;
  }
  
  const logError = (msg, e) => {
    if (!silent) console.error(msg, e);
  };
  
  // Different logic based on environment and backend
  switch (backendName) {
    case 'wasm':
      try {
        // Node.js environment
        if (typeof window === 'undefined') {
          try {
            // Try dynamic import 
            const tfwasm = await import('@tensorflow/tfjs-backend-wasm');
            return isBackendRegistered('wasm');
          } catch (e) {
            logError('Error loading WASM backend in Node.js:', e);
            return false;
          }
        } 
        // Browser environment
        else {
          try {
            // In browser, WASM backend might be loaded from a script tag
            if (window.tf && window.tf.wasm) {
              return true;
            }
            
            // Try to load from CDN dynamically
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm/dist/tf-backend-wasm.min.js';
            
            return new Promise((resolve) => {
              script.onload = () => {
                // Check if WASM backend is now registered
                resolve(isBackendRegistered('wasm'));
              };
              script.onerror = () => resolve(false);
              document.head.appendChild(script);
            });
          } catch (e) {
            logError('Error loading WASM backend in browser:', e);
            return false;
          }
        }
        return false;
      } catch (e) {
        logError('Error loading WASM backend:', e);
        return false;
      }
      
    case 'webgpu':
      // WebGPU is still experimental and usually available only in browsers
      if (typeof window !== 'undefined') {
        try {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-webgpu/dist/tf-backend-webgpu.min.js';
          
          return new Promise((resolve) => {
            script.onload = () => {
              resolve(isBackendRegistered('webgpu'));
            };
            script.onerror = () => resolve(false);
            document.head.appendChild(script);
          });
        } catch (e) {
          logError('Error loading WebGPU backend:', e);
          return false;
        }
      }
      return false;
      
    default:
      return false;
  }
}

/**
 * Helper function to initialize WASM with more user-friendly error handling
 * 
 * @param {boolean} silent - Whether to suppress error messages
 * @returns {Promise<boolean>} Promise resolving to true if WASM was loaded successfully
 */
async function initializeWasm(silent = false) {
  try {
    // First check if WASM is already available
    if (isWasmInitialized()) {
      return true;
    }
    
    // Try to load WASM backend
    const success = await loadBackend('wasm', silent);
    
    // If successfully loaded, initialize it
    if (success) {
      if (typeof window !== 'undefined' && window.tf && window.tf.wasm) {
        // In browser with script tag
        try {
          await window.tf.wasm.setWasmPaths(
            'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm/dist/'
          );
          wasmBackendInitialized = true;
          return true;
        } catch (e) {
          if (!silent) {
            console.warn('WASM initialization failed in browser:', e.message);
          }
          return false;
        }
      }
      
      wasmBackendInitialized = true;
      return true;
    }
    
    return false;
  } catch (e) {
    if (!silent) {
      console.warn('WASM initialization error:', e.message);
    }
    return false;
  }
}

/**
 * Check if WASM backend was successfully initialized
 * 
 * @returns {boolean} True if WASM is available
 */
function isWasmInitialized() {
  return wasmBackendInitialized || isBackendRegistered('wasm');
}

// Export functions
module.exports = {
  getRegisteredBackends,
  isBackendRegistered,
  isBackendAvailable,
  setBestAvailableBackend,
  loadBackend,
  isWasmInitialized,
  initializeWasm
};