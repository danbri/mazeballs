// ctNet.js
// τy' = -y + Wσ(g(y+ θ)) + I

(function (global) {
    // Import TensorFlow.js if running in Node.js
    const tf = typeof module !== "undefined" && module.exports ? require("@tensorflow/tfjs") : global.tf;
 
  const ctNet = function (spec) {

// τy' = -y + Wσ(g(y+ θ)) + I

    if (spec === undefined) {
      spec = {};
    }
  
    let override_squashing_function = spec["squashfn"] || false;
  
    if (typeof spec === "number") {
      spec = { size: spec };
    }
  
    // avoiding use of this., clumsily.
    function docalc(net, livestates, liveoutputs) {
  
        // Set a default value for net.step_size if not provided in spec
        net.step_size = spec.step_size || 0.1;

        // todo: add input_weights?
  
      /*  
     yprime = -states + total_inputs
     delta = yprime * step_size / tau
     states += delta
     outputs = tf.sigmoid(gain*(states+bias)) */
  
      // activation function
      // vectorized.
      function squash(x) {
        // return tf.tanh(x);
  
        // return tf.sigmoid(x);
  
        if (override_squashing_function == false) {
          return tf.sigmoid(x);
        } else {
          // console.log("Alternate squashing function!", spec["squashfn"]);
          return spec["squashfn"](x);
        }
      }
      // todo: api for other functions
      // eg @ylecun
      // 1.7159 * tanh((2x/3)
      // http://yann.lecun.com/exdb/publis/pdf/lecun-98b.pdf
      // can we try to show sweep with these parqms?
  
      // more!
      // https://edizquierdo.wordpress.com/2006/12/09/generative-music-creative-dynamical-systems-and-ctrnn-activation-functions/
      // eg "...half way between sin and tanh"
  
      const calc = tf.tidy(() => {
        let total_inputs = net.weights.dot(liveoutputs).add(net.ext_inputs);
        /* todo: we are leaking yprime 
  and output tensors, hence cleanup 
  downstream from mainloop. Address here? */
  
        // let oldgradients = yprime;
        let yprime = total_inputs.sub(livestates); //.div(net.taus); // y' = -y +g(Wo+ϑ)
        //oldgradients.dispose(); // junked!
        //console.log("Net step size is:", net.step_size);
        let delta = yprime.mul(tf.scalar(net.step_size)).div(net.taus); // Euler step
        let trash = livestates;
        livestates = livestates.add(delta);
        trash.dispose();
        liveoutputs = squash(
          livestates.transpose().add(net.biases).mul(net.gains)
        ); //σ
  
        // somewhere we need this - problem has been figuring out when to do it
        // new approach - copy to cpu each cycle. Expensive? should make it a flag and do some perf timings. Could also be done
        // every n loops...
        // coreloop.outputs.dispose();
        //coreloop.yprime.dispose();
  
        if (livestates.arraySync().includes(NaN)) {
          nanlog.push(livestates.arraySync());
          throw { states: livestates };
        }
  
        return {
          states: livestates,
          states_cpu: livestates.arraySync(),
          outputs: liveoutputs,
          outputs_cpu: liveoutputs.arraySync(),
          yprime: yprime,
          yprime_cpu: yprime.arraySync()
        };
      });
      //----
      return calc;
    }
  
    /* Have the dynamics settled down?
       logic in js i.e. CPU for now
       TODO: use tf.whereAsync to use GPU */
  
    function in_fixed_point(yp) {
      return tf.tidy(() => {
        const mask = yp.equal([0]).asType("bool");
        const isz = mask.arraySync().every((item) => item !== 0);
        return isz;
      });
    }
  
    const ones1d = (n) => {
      return tf.ones([n]);
    };
  
    const genRand2d = (n) =>
      tf.tensor2d(
        Array.from({ length: n * n }, () => Math.random() * 2),
        [size, size]
      );
  
    const genFixed2d = (n) =>
      tf.tensor2d(Array(size * size).fill(0.1), [size, size]);
  
    const zeros1d = (n) => {
      return tf.zeros([n]);
    };
  
    if (!spec.size) {
      spec.size = 3;
    } // todo: move to a principled Examples structure
  
    let size = spec.size;
  
    var net = { size: spec.size };
  
    net.ones1d = ones1d;
    net.zeros1d = zeros1d;
  
    if (spec.init_weights) {
      if (Array.isArray(spec.init_weights)) {
        //  amon.log("init weights as array: ", spec.init_weights);
        net.weights = tf.tensor2d(spec.init_weights, [size, size]);
      } else {
        if (typeof spec.init_weights === "function") {
          let values = Array.from({ length: size * size }, spec.init_weights);
          net.weights = tf.tensor2d(values, [size, size]);
        } else {
          throw (
            ("init_weights should be an array, a or a function.",
            spec.init_weights)
          );
        }
      }
    } else {
      net.weights = genRand2d(size);
    }
  
    net.biases = zeros1d(size);
    net.taus = ones1d(size);
    net.gains = ones1d(size);
  
    // things that change (will be generators not mutables):
    net.ext_inputs = zeros1d(size);
    net.states = zeros1d(size);
    net.outputs = zeros1d(size);
  
    // todo - expose functions as an api here
  
    net.eulerStep = docalc;
    net.in_fixed_point = in_fixed_point;
  
    // amon.log("net created: ", net);
    net.run_duration = 10000;
  
    //net.freeze = function () {};
    net.freeze = function (net, weights) {
      if (net.weights != undefined) {
        net.weights = weights;
        net.weights_cpu = net.weights.arraySync();
        Object.freeze(net);
      } else {
        console.log("Can't freeze a weightless network."); // throw exception?
        throw "Can't freeze a network with no weight matrix.";
      }
    };
  
// BEGIN ASYNC GENERATOR 

    // Add the runSimulation function to the network object
    net.runSimulation = async function* () {
        let loopcount = 0;
        let livestates = this.states;
        let liveoutputs = this.outputs;
        var calc;
        while (loopcount++ < this.run_duration) {
          const calc = await this.eulerStep(this, livestates, liveoutputs);
          livestates = calc.states;
          liveoutputs = calc.outputs;
  
          yield {
            net: this,
            states: calc.states,
            states_cpu: calc.states.arraySync(),
            outputs: calc.outputs,
            outputs_cpu: calc.outputs.arraySync(),
            yprime: calc.yprime,
            yprime_cpu: calc.yprime.arraySync(),
            count: loopcount,
            in_fp: this.in_fixed_point(calc.yprime)
          };
  
          // OUCH
          // calc.outputs.dispose();
          // calc.yprime.dispose(); // for now flush the GPU version
        }
      };
      

// END ASYNC GENERATOR



    return net;
  };

 // Expose ctNet as a global variable
 if (typeof module !== "undefined" && module.exports) {
    // Node.js / CommonJS
    module.exports = ctNet;
  } else {
    // Browser
    global.ctNet = ctNet;
  }
})(typeof window !== "undefined" ? window : global);