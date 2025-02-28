const terser = require('@rollup/plugin-terser');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');

// List of true external dependencies
const externals = ['@tensorflow/tfjs', '@tensorflow/tfjs-backend-wasm'];

module.exports = [
  // UMD build
  {
    input: 'src/index.js',
    plugins: [
      nodeResolve({
        preferBuiltins: true
      }),
      commonjs()
    ],
    output: [
      {
        file: 'dist/ctnet.js',
        format: 'umd',
        name: 'CTNet',
        sourcemap: true,
        globals: {
          '@tensorflow/tfjs': 'tf',
          '@tensorflow/tfjs-backend-wasm': 'tfwasm'
        }
      },
      {
        file: 'dist/ctnet.min.js',
        format: 'umd',
        name: 'CTNet',
        plugins: [terser()],
        sourcemap: true,
        globals: {
          '@tensorflow/tfjs': 'tf',
          '@tensorflow/tfjs-backend-wasm': 'tfwasm'
        }
      }
    ],
    external: externals
  },
  // ES module build
  {
    input: 'src/index.js',
    plugins: [
      nodeResolve({
        preferBuiltins: true
      }),
      commonjs()
    ],
    output: [
      {
        file: 'dist/ctnet.mjs',
        format: 'es',
        sourcemap: true
      },
      {
        file: 'dist/ctnet.min.mjs',
        format: 'es',
        plugins: [terser()],
        sourcemap: true
      }
    ],
    external: externals
  }
];