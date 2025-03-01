# CTNet Interactive Demos

This directory contains interactive demonstrations of the CTNet library capabilities.

## Demos

- `browser_demo.html`: Basic browser-based demonstration of a continuous-time network.
- `enhanced-browser-demo.html`: Advanced browser demo with interactive controls and multiple network types.

## Running Demos

The demos can be opened directly in a web browser. For best results, serve them from a local web server:

```bash
# From the project root directory
npx serve .
```

Then navigate to the demos in your browser (e.g., http://localhost:5000/demos/enhanced-browser-demo.html).

## Offline Use

The demos are designed to work offline. The necessary dependencies are vendored in the `vendor` directory, and the demos will automatically use these local versions when CDN resources are unavailable.