"use strict";

// Module dependencies.
const Benchmark = require('benchmark');
const Table = require('cli-table');

module.exports = class BenchTable extends Benchmark.Suite {
    /**
     * BenchTable
     * The `BenchTable` constructor. `BenchTable` is extended from [Benchmark.Suite](http://benchmarkjs.com/docs#Suite).
     *
     * @name BenchTable
     * @function
     * @param {String} name  A name to identify the suite.
     * @param {String} options Options object. A special boolean option `isTransposed`
     * is available for Benchtable–if set to `true`, the output ASCII table will be
     * transposed: the benchmarked functions will be organized into columns, while
     * inputs will be organized into rows. This is useful for situations where the
     * number of inputs is large, and the number of functions is small. This option
     * defaults to `false`.
     */
    constructor(name, options) {

        super(name, options);

        this._functions = [];
        this._functionNames = [];
        this._functionOptions = [];
        this._inputs = [];
        this._inputNames = [];

        this._results = {};

        // mappings from benchmark names to function and input indices
        // as { funcIdx, inputIdx }
        this._mappings = {};

        // if transposed, then functions are in columns and inputs are in rows
        this._transposed = options && options.isTransposed;

        /**
         * Use the 'cycle' event to store results and build a table
         * after all BenchTable functions are evaluated for all inputs.
         **/

        this.on('cycle', event => {
            var key = event.target.name;
            var worst_idx, best_idx, worst, best, curr;
            var i, j;
            var funName, inputName, item;

            if (!(key in this._mappings)) {
                return;
            }

            // store current result
            funName = this._functionNames[this._mappings[key].funcIdx];
            this._results[funName].push(event.target);
            this._counter -= 1;

            if (this._counter !== 0) {
                return;
            }

            // compute best and worst results for each input
            for (i = 0; i < this._inputs.length; i++) {
                worst_idx = 0, best_idx = 0;
                best = this._results[this._functionNames[best_idx]][i];
                worst = this._results[this._functionNames[worst_idx]][i];

                for (j = 0; j < this._functions.length; j++) {
                    curr = this._results[this._functionNames[j]][i];

                    if (curr.hz <= worst.hz) {
                        worst_idx = j;
                        worst = this._results[this._functionNames[worst_idx]][i];
                    }

                    if (curr.hz >= best.hz) {
                        best_idx = j;
                        best = this._results[this._functionNames[best_idx]][i];
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
            var headers = this._transposed ? [""].concat(this._functionNames) : [""].concat(this._inputNames);

            this.table = new Table({
                head: headers,
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
                truncate: '…'
            });

            if (!this._transposed) {
                for (i = 0; i < this._functions.length; i++) {
                    item = {};
                    funName = this._functionNames[i];
                    item[funName] = [];

                    for (j = 0; j < this._results[funName].length; j++) {
                        curr = this._results[funName][j];
                        item[funName].push(toTableStr(curr));

                        if (this._functions.length > 1) {
                            if (curr._isWorst) {
                                item[funName][j] = item[funName][j].red;
                            } else if (curr._isBest) {
                                item[funName][j] = item[funName][j].green;
                            }
                        }
                    }

                    this.table.push(item);
                }
            } else {
                for (i = 0; i < this._inputs.length; i++) {
                    item = {};
                    inputName = this._inputNames[i];
                    item[inputName] = [];

                    for (j = 0; j < this._functionNames.length; j++) {
                        funName = this._functionNames[j];
                        curr = this._results[funName][i];
                        item[inputName].push(toTableStr(curr));

                        if (this._functions.length > 1) {
                            if (curr._isWorst) {
                                item[inputName][j] = item[inputName][j].red;
                            } else if (curr._isBest) {
                                item[inputName][j] = item[inputName][j].green;
                            }
                        }
                    }

                    this.table.push(item);
                }
            }
        });
    }

    /**
     * run
     * Runs the suite.
     *
     * @name run
     * @function
     * @param {Object} config The options object. [See `benchmark.js` API docs.](http://benchmarkjs.com/docs#Suite_prototype_run)
     */
    run(config) {
        var mapkey, mapfun;

        let createBenchmarkFunction = (fun, options, input) => {
            if (options.defer) {
                return deferred => {
                    fun.apply(this, [deferred].concat(input))
                };
            }
            return () => {
                fun.apply(this, input);
            };
        }

        for (var i = 0; i < this._functions.length; i++) {
            for (var j = 0; j < this._inputs.length; j++) {
                mapkey = this._functionNames[i] + " for inputs " + this._inputNames[j];
                mapfun = createBenchmarkFunction(this._functions[i], this._functionOptions[i], this._inputs[j]);
                this.add(mapkey, mapfun, this._functionOptions[i]);
                this._mappings[mapkey] = {
                    funcIdx: i,
                    inputIdx: j
                };
            }
        }

        this._counter = this._functions.length * this._inputs.length;

        super.run(config);
    }

    /**
     * addFunction
     * Specify functions to be benchmarked.
     * This function may be called multiple times to add multiple functions.
     *
     * @name run
     * @function
     * @param {String} name A name to identify the function.
     * @param {Function} fun The test to benchmark.
     * @param {Object} options The options object.
     * @return {BenchTable} The `BenchTable` instance.
     */
    addFunction(name, fun, options) {
        this._functions.push(fun);
        this._functionNames.push(name);
        this._functionOptions.push(options || {});
        this._results[name] = [];
        return this;
    }

    /**
     * addInput
     * Specify inputs for functions.
     * This function may be called multiple times to add multiple inputs.
     *
     * @name addInput
     * @function
     * @param {String} name A name to identify the input.
     * @param {Array} input The array containing arguments that will be
     * passed to each benchmarked function. Therefore, the number of
     * elements in the `input` array should match the number of arguments of
     * each specified function (i.e. the array will be "unpacked" when
     * invoking functions, they will not receive a single array argument).
     * @return {BenchTable} The `BenchTable` instance.
     */
    addInput(name, input) {
        this._inputs.push(input);
        this._inputNames.push(name);
        return this;
    }
}
