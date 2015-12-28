/**
 * Module dependencies.
 */

var Benchmark = require('benchmark');
var Table = require('cli-table');

/**
 * Table constructor.
 */

function BenchTable(name, options) {
  var self = this;

  Benchmark.Suite.call(self, name, options);

  self._functions = [];
  self._functionNames = [];
  self._functionOptions = [];
  self._inputs = [];
  self._inputNames = [];

  self._results = {};

  // mappings from benchmark names to function and input indices
  // as { funcIdx, inputIdx }
  self._mappings = {};

  // if transposed, then functions are in columns and inputs are in rows
  self._transposed = options && options.isTransposed;

  /**
   * Use the 'cycle' event to store results and build a table
   * after all BenchTable functions are evaluated for all inputs.
   **/

  self.on('cycle', function(event) {
    var key = event.target.name;
    var self = this;
    var worst_idx, best_idx, worst, best, curr;
    var i, j;
    var funName, inputName, item;

    if (!(key in self._mappings)) {
      return;
    }

    // store current result
    funName = self._functionNames[self._mappings[key].funcIdx];
    self._results[funName].push(event.target);
    self._counter -= 1;

    if (self._counter !== 0) {
      return;
    }

    // compute best and worst results for each input
    for (i=0; i<self._inputs.length; i++) {
      worst_idx = 0, best_idx = 0;
      best = self._results[self._functionNames[best_idx]][i];
      worst = self._results[self._functionNames[worst_idx]][i];

      for (j=0; j<self._functions.length; j++) {
        curr = self._results[self._functionNames[j]][i];

        if (curr.hz <= worst.hz) {
          worst_idx = j;
          worst = self._results[self._functionNames[worst_idx]][i];
        }

        if (curr.hz >= best.hz) {
          best_idx = j;
          best = self._results[self._functionNames[best_idx]][i];
        }
      }

      worst._isWorst = true;
      best._isBest = true;
    }

    function toTableStr(par) {
      if (par.error) {
        return 'ERROR';
      } else {
        return Benchmark.formatNumber(par.hz.toFixed(par.hz < 100 ? 2 : 0)) + ' ops/sec';
      }
    }

    // create cli-table based on results
    var headers = self._transposed ? [""].concat(self._functionNames) : [""].concat(self._inputNames);

    self.table = new Table({
      head: headers,
       chars: {
         'top': '-', 'top-mid': '+', 'top-left': '+', 'top-right': '+',
         'bottom': '-', 'bottom-mid': '+', 'bottom-left': '+', 'bottom-right': '+',
         'left': '|', 'left-mid': '+',
         'mid': '-', 'mid-mid': '+',
         'right': '|', 'right-mid': '+'
       },
       truncate: '…'
    });

    if (!self._transposed) {
      for (i=0; i<self._functions.length; i++) {
        item = {};
        funName = self._functionNames[i];
        item[funName] = [];

        for (j=0; j<self._results[funName].length; j++) {
          curr = self._results[funName][j];
          item[funName].push(toTableStr(curr));

          if (self._functions.length > 1) {
            if (curr._isWorst) {
              item[funName][j] = item[funName][j].red;
            } else if (curr._isBest) {
              item[funName][j] = item[funName][j].green;
            }
          }
        }

        self.table.push(item);
      }
    } else {
      for (i=0; i<self._inputs.length; i++) {
        item = {};
        inputName = self._inputNames[i];
        item[inputName] = [];

        for (j=0; j<self._functionNames.length; j++) {
          funName = self._functionNames[j];
          curr = self._results[funName][i];
          item[inputName].push(toTableStr(curr));

          if (self._functions.length > 1) {
            if (curr._isWorst) {
              item[inputName][j] = item[inputName][j].red;
            } else if (curr._isBest) {
              item[inputName][j] = item[inputName][j].green;
            }
          }
        }

        self.table.push(item);
      }
    }
  });
}

/**
 * BenchTable is a benchamrkjs Benchmark.Suite subclass.
 */

BenchTable.prototype = Object.create(Benchmark.Suite.prototype);

/**
 * Wrap Benchmark.Suite.run to additionally create and run all functions for all inputs.
 */

BenchTable.prototype.run = function(config) {
  var self = this, mapkey, mapfun;

  function createBenchmarkFunction(fun, options, input) {
    if (options.defer) {
      return function (deferred) {
        fun.apply(self, [deferred].concat(input))
      }
    }
    return function() {
      fun.apply(self, input);
    };
  }

  for (var i=0; i<self._functions.length; i++) {
    for (var j=0; j<self._inputs.length; j++) {
      mapkey = self._functionNames[i] + " for inputs " + self._inputNames[j];
      mapfun = createBenchmarkFunction(self._functions[i], self._functionOptions[i], self._inputs[j]);
      self.add(mapkey, mapfun, self._functionOptions[i]);
      self._mappings[mapkey] = { funcIdx : i, inputIdx : j };
    }
  }

  self._counter = self._functions.length * self._inputs.length;

  Benchmark.Suite.prototype.run.call(self, config);
};

/**
 * Add a function which should be evaluated.
 */

BenchTable.prototype.addFunction = function(name, fun, options) {
  this._functions.push(fun);
  this._functionNames.push(name);
  this._functionOptions.push(options || {});
  this._results[name] = [];

  return this;
};

/**
 * Add an input for which the functions should be evaluated.
 */

BenchTable.prototype.addInput = function(name, input) {
  this._inputs.push(input);
  this._inputNames.push(name);

  return this;
};

/**
 * Module exports.
 */

module.exports = BenchTable;
module.exports.version = '0.0.6';
