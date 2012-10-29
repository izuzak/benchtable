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
  self._inputs = [];
  self._inputNames = [];
  self._mappings = {};
  self._results = {};
  
  /**
   * Use the 'cycle' event to store results and build a table 
   * after all BenchTable functions are evaluated for all inputs.
   **/
    
  self.on('cycle', function(event) {
    var key = event.target.name;
    var self = this;
    
    if (!(key in self._mappings)) {
      return;
    }
    
    self._results[self._functionNames[self._mappings[key].funcIdx]].push(event.target);
    self._counter -= 1;
    
    if (self._counter === 0) {
      for (var i=0; i<self._inputs.length; i++) {
        var worst_idx = 0;
        var best_idx = 0;
        
        for (var j=0; j<self._functions.length; j++) {          
          if (self._results[self._functionNames[j]][i].hz <= self._results[self._functionNames[worst_idx]][i].hz) {
            worst_idx = j;
          }
          
          if (self._results[self._functionNames[j]][i].hz >= self._results[self._functionNames[best_idx]][i].hz) {
            best_idx = j;
          }          
        }
                
        self._results[self._functionNames[worst_idx]][i]._isWorst = true;
        self._results[self._functionNames[best_idx]][i]._isBest = true;
      }
      
      self.table = new Table({
        head: [""].concat(self._inputNames),
         chars: {
           'top': '-',
           'top-mid': '+',
           'top-left': '+',
           'top-right': '+',
           'bottom': '-',
           'bottom-mid': '+',
           'bottom-left': '+',
           'bottom-right': '+',
           'left': '|',
           'left-mid': '+',
           'mid': '-',
           'mid-mid': '+',
           'right': '|',
           'right-mid': '+'
         },
         truncate: '~'
      });
      
      function toTableStr(par) {
        if (par.error) {
          return 'ERROR';
        } else {
          return Benchmark.formatNumber(par.hz.toFixed(par.hz < 100 ? 2 : 0)) + ' ops/sec';
        }
      }
      
      for (var i=0; i<self._functions.length; i++) {
        var item = {};
        item[self._functionNames[i]] = [];
        
        for (var j=0; j<self._results[self._functionNames[i]].length; j++) {
          item[self._functionNames[i]].push(toTableStr(self._results[self._functionNames[i]][j]));
          
          if (self._functions.length > 1) {
            if (self._results[self._functionNames[i]][j]._isWorst) {
              item[self._functionNames[i]][j] = item[self._functionNames[i]][j].red;
            } else if (self._results[self._functionNames[i]][j]._isBest) {
              item[self._functionNames[i]][j] = item[self._functionNames[i]][j].green;
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
  var self = this;
  for (var i=0; i<self._functions.length; i++) {
    for (var j=0; j<self._inputs.length; j++) {      
      var mapkey = self._functionNames[i] + " for params " + self._inputNames[j];
      self.add(mapkey, function(x,y) { return function() { self._functions[x].apply(self, self._inputs[y]); } }(i, j));
      self._mappings[mapkey] = { funcIdx : i, paramsIdx : j };
    }
  }
  
  self._counter = self._functions.length * self._inputs.length;
  
  Benchmark.Suite.prototype.run.call(self, config);
};

/**
 * Add a function which should be evaluated.
 */

BenchTable.prototype.addFunction = function(name, fun) {
  this._functions.push(fun);
  this._functionNames.push(name);
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
module.exports.version = '0.0.1';