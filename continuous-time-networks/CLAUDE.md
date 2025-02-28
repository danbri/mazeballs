# CTNets Library Development Notes

## Project Overview
- Working on a continuous-time networks (CTNets) JavaScript library that simulates CTRNNs
- Library uses TensorFlow.js and supports multiple backends (CPU, WASM, WebGL)
- Two-step initialization process is an intentional design pattern
- Project originated in ObservableHQ and heavily uses generators for streaming simulation data

## Repository Reorganization Plan

### Overall Structure
```
mazeballs/                         # Top-level repository
├── README.md                      # General project overview
├── LICENSE                        # Apache 2.0 license
├── .gitignore                     # Git ignore file
├── continuous-time-networks/      # CTNet project subfolder
│   ├── README.md                  # CTNet-specific documentation
│   ├── package.json               # Main package.json for CTNet
│   ├── CLAUDE.md                  # Development notes and guidelines
│   ├── src/                       # Source code
│   │   ├── ctnet.js               # Core implementation
│   │   ├── backends.js            # Backend utilities
│   │   └── index.js               # Main entry point
│   ├── dist/                      # Built files
│   │   ├── ctnet.js               # UMD build
│   │   ├── ctnet.min.js           # Minified UMD
│   │   ├── ctnet.mjs              # ES module
│   │   └── ctnet.min.mjs          # Minified ES module
│   ├── tests/                     # Test files
│   │   ├── ctNet.test.js          # Core tests
│   │   ├── backends.test.js       # Backend tests
│   │   └── browser/               # Browser-specific tests
│   ├── examples/                  # Code examples showing specific features
│   │   ├── node/                  # Node.js specific examples
│   │   │   ├── basic-oscillator.js
│   │   │   └── backend-selection.js
│   │   └── browser/               # Browser specific examples
│   │       ├── simple-oscillator.html
│   │       └── backend-switching.html
│   ├── demos/                     # Interactive demonstrations
│   │   ├── browser-demo.html      # Main browser demo
│   │   ├── enhanced-browser-demo.html # Enhanced demo
│   │   ├── assets/                # Demo assets (CSS, images)
│   │   └── vendor/                # Vendored dependencies for offline use
│   └── networks/                  # Example network definitions
│       ├── oscillators/           # Oscillator definitions
│       └── custom/                # Other network types
└── other-projects/                # Placeholder for future work
```

### File Organization Clarifications

1. **Package Structure**:
   - `continuous-time-networks/package.json` is the main package.json for the CTNet project
   - NPM package name would be `ctnet` or `@mazeballs/ctnet`

2. **Examples vs Demos**:
   - **Examples/** - Focused code snippets demonstrating specific features or uses
     - Short, focused on a single concept
     - Well-commented for educational purposes
     - Organized by environment (node/browser)
   
   - **Demos/** - Interactive applications showing the library in action
     - Full applications rather than snippets
     - More complex, showing multiple features together
     - Often with UIs and visualizations

3. **Documentation Strategy**:
   - README.md files at key locations
   - API documentation generated from source code comments
   - Examples serve as documentation for specific features

### Migration Steps
1. Create new private "mazeballs" repo
2. Set up continuous-time-networks/ folder with structure above
3. Migrate existing code from ctnet-library
4. Clean up and organize the demos
5. Set up build pipeline and testing infrastructure
6. Rename old repo to "oldmazeballs" for reference

## Key Accomplishments
1. Fixed oscillation issue in enhanced-browser-demo.html by ensuring proper initialization and using small step size (0.01)
2. Created comprehensive unit testing framework for both Node.js and browser environments
3. Added utility for testing across all available TensorFlow.js backends
4. Made WASM backend a direct dependency for better performance
5. Improved browser-based testing with proper UI styling and better visualization
6. Created thorough documentation on running tests and using different backends

## Files Worked On
- `/ctnet-library/tests/backends.test.js`: Backend testing utilities
- `/ctnet-library/tests/ctNet.test.js`: Core library unit tests
- `/ctnet-library/tests/check-wasm.js`: WASM verification tool
- `/ctnet-library/src/backends.js`: Backend selection utilities
- `/ctnet-demo/unit-tests.html`: Browser-based test runner
- `/ctnet-demo/enhanced-browser-demo.html`: Interactive demo with various network types
- `/ctnet-library/package.json`: Updated dependencies and scripts
- `/ctnet-library/README.md`: Improved documentation
- `/ctnet-demo/CLAUDE.md`: Critical warnings and development notes

## Key Learnings
- Never modify network parameters without explicit permission
- Use consistent step sizes (0.01) rather than special-casing
- Avoid modifying reference implementations
- WASM backend provides good performance across environments

## Technical Notes
- Beer (1995) oscillator parameters remain the reference implementation
- TensorFlow.js backend auto-selection follows WebGL → WASM → CPU preference order
- All backends should produce consistent behavior with the same parameters

## API Design Direction
1. Maintaining separation between network definition and instantiation
2. Generator-centric API for streaming simulation results
3. Support for Observable HQ's reactive programming model
4. Helper generators for common simulation patterns

## Important Notes on API Usage
The ctnet.js implementation uses a deliberate two-step initialization process:
1. Create the network with initial configuration (weights, size)
2. Manually set other parameters after initialization

This is the INTENDED DESIGN PATTERN as confirmed by the library author. It is not a bug or limitation:

```javascript
// First step: Create network with basic structure
const myNet = ctNet({
  size: 2,
  init_weights: [
    [4.5, 1],
    [-1, 4.5]
  ]
});

// Second step: Configure runtime parameters
myNet.states = tf.tensor1d([0.1, 0.5]);
myNet.biases = tf.tensor1d([-2.75, -1.75]);
myNet.step_size = 0.2;
myNet.run_duration = 1000;
```

This pattern is used consistently in both Node.js and browser implementations, and is a fundamental design choice by the author.

## CRITICAL WARNINGS

1. NEVER modify network parameters defined in example files without explicit permission from the author.
2. DO NOT add special-case handling for different network types that changes their parameters.
3. Use consistent step sizes (prefer smaller values like 0.01) rather than special-casing different networks.
4. Avoid premature optimization that creates tech debt and bugs.
5. Maintain the integrity of reference implementations, even if they don't oscillate as expected.
6. ALWAYS CONSULT BEFORE making significant architectural changes (e.g. CommonJS vs ESM, changing build tools, etc.).
7. DO NOT make changes that would break compatibility with existing code without explicit approval.

## Development Commands
- Run tests: `npm test`
- Build library: `npm run build`
- Test WASM backend: `npm run test:wasm`
- Clean build output: `npm run clean` (removes dist/ directory)
- Full cleanup: `npm run clean:all` (removes dist/ and node_modules/, requires npm install afterwards)
- Watch and rebuild on changes: `npm run dev`

## NPM Publishing Workflow

The package is published to npm as `@mazeballs/ctnet-experimental` with the "experimental" tag.

### Publishing Commands
- Publish a patch update: `npm run publish:patch` (e.g., 0.1.0 → 0.1.1)
- Publish a minor update: `npm run publish:minor` (e.g., 0.1.0 → 0.2.0)
- Publish an alpha update: `npm run publish:alpha` (e.g., 0.1.0-alpha.1 → 0.1.0-alpha.2)

With 2FA enabled, you need to add the OTP code:
```bash
npm run publish:patch -- --otp=123456
```

The publish scripts will automatically:
1. Update the version in package.json
2. Create a git tag for the version
3. Build the library
4. Publish to npm with the "experimental" tag

### WASM Backend Support
The package includes the WASM binary file in a `wasm` directory, which ensures the WASM backend can work properly when installed from NPM. The code automatically searches for the WASM file in the following locations:
1. The package's own `wasm` directory
2. Node modules directory

### Rollup Configuration
The package uses Rollup with the following plugins to bundle the code:
- `@rollup/plugin-node-resolve`: Resolves module imports
- `@rollup/plugin-commonjs`: Converts CommonJS modules to ES modules
- `@rollup/plugin-terser`: Minifies the code

The build process creates both UMD and ES module formats:
- `dist/ctnet.js` (UMD)
- `dist/ctnet.min.js` (UMD, minified)
- `dist/ctnet.mjs` (ES module)
- `dist/ctnet.min.mjs` (ES module, minified)

### Installation from NPM
Users can install with:
```bash
npm install @mazeballs/ctnet-experimental@experimental
```

This creates a globally scoped package that's clearly marked as experimental.