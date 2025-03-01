// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('CTNet documentation site loaded');
    
    // Initialize TensorFlow.js for examples
    if (typeof tf \!== 'undefined') {
        // Set up async initialization
        async function initTensorFlow() {
            console.log('Initializing TensorFlow.js...');
            
            try {
                // Initialize TensorFlow.js
                await tf.ready();
                console.log('TensorFlow.js initialized');
                
                // Try to set up WASM backend if available
                if (typeof wasm \!== 'undefined') {
                    try {
                        await tf.setBackend('wasm');
                        console.log('WASM backend initialized');
                    } catch (e) {
                        console.log('WASM initialization failed, using default backend');
                    }
                }
                
                console.log('Using backend:', tf.getBackend());
            } catch (e) {
                console.error('TensorFlow.js initialization error:', e);
            }
        }
        
        // Start initialization
        initTensorFlow();
    }
});
