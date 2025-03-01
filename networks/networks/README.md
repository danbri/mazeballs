# CTNet Network Definitions

This directory contains network definitions for use with the CTNet library.

## Oscillators

The `oscillators` directory contains definitions for oscillatory networks:

- `beer_oscillator.json` - Classic Beer (1995) two-node oscillator

## Examples

The `examples` directory contains a variety of network definitions for demonstration purposes:

- `netdef_2c.json` - Two-node network example
- `netdef_3a.json` - Three-node network example
- `netdef_4b.json` - Four-node network example 
- `beer_2node_osc.json` - Beer (1995) oscillator parameters
- `complex_3node.json` - Complex three-node network
- `oscillatory_2node.json` - Two-node oscillator
- `oscillatory_4node.json` - Four-node oscillator
- `classic_oscillator.json` - Classic oscillator configuration
- `tuned_oscillator.json` - Tuned oscillator with optimized parameters
- `working_oscillator.json` - Working oscillator with reliable behavior

## Format

Network definition files are in JSON format with the following structure:

```json
{
  "name": "Network name",
  "description": "Network description",
  "size": 2,
  "taus": [1, 1],
  "biases": [-2.75, -2.75],
  "weights": [
    [4.5, 1],
    [1, 4.5]
  ],
  "gains": [1, 1],
  "step_size": 0.01
}
```

### Fields

- `name`: String name of the network
- `description`: Text description of the network
- `size`: Number of nodes
- `taus`: Array of time constants for each node
- `biases`: Array of bias values for each node
- `weights`: 2D array of connection weights between nodes
- `gains`: Array of gain values for each node
- `step_size`: (Optional) Recommended step size for simulation