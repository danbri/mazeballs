const terser = require('@rollup/plugin-terser');

module.exports = [
  // UMD build
  {
    input: 'src/index.js',
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
    external: ['@tensorflow/tfjs', '@tensorflow/tfjs-backend-wasm']
  },
  // ES module build
  {
    input: 'src/index.js',
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
    external: ['@tensorflow/tfjs', '@tensorflow/tfjs-backend-wasm']
  }
];