# Benchtable

Benchtable is a NodeJS module which provides an easy way to run performance tests for a set of JavaScript functions on a set of inputs, and display the evaluation results as an ASCII table.

This is useful for situations when you are:

 * evaluating the performance of a single function for a range of inputs (e.g. of different size)
 * comparing the performance of a set of functions for a specific input (e.g. different implementations of same functionality)
 * comparing the performance of a set of functions for the same set of inputs

Benchtable is not a new JavaScript benchmarking framework -- it extends the already excellent [benchmark.js](https://github.com/bestiejs/benchmark.js) framework.
Benchmarks are executed using benchmark.js and displayed using [cli-table](https://github.com/LearnBoost/cli-table).

![Screenshot](/screenshot.png)

## Features

 * a Benchtable suite is an extension (subclass) of the [Benchmark.js Suite API](http://benchmarkjs.com/docs#Suite)
 * a simple API for defining benchmarks functions and inputs
 * display of benchmarking results as an ASCII table, with ops/sec measure used for table data
 * simple visual identification of functions with best and worst performance for each input using color highlighting (red = worst, green = best)

## Installation

```sh
npm i --save benchtable
```

## API and usage
`BenchTable` is a class extended from the benchmark.js's [`Benchmark.Suite`](http://benchmarkjs.com/docs#Suite) class - all
functions exposed by `Benchmark.Suite` are also provided by Benchtable and therefore a Benchtable object may be used like
an ordinary `Benchmark.Suite`.

The `Benchmark.Suite.prototype.add` method can be used to add functions to be benchmarked, and while such functions will
indeed be benchmarked with Benchtable–their results will not be shown in the results ASCII table.

Please use the `BenchTable`'s `addFunction` and `addInput` methods for specifying BenchTable benchmarks, as shown below.

### `BenchTable(name, options)`
The `BenchTable` constructor. `BenchTable` is extended from [Benchmark.Suite](http://benchmarkjs.com/docs#Suite).

#### Params
- **String** `name`: A name to identify the suite.
- **String** `options`: Options object. A special boolean option `isTransposed` is available for Benchtable–if set to `true`, the output ASCII table will be
transposed: the benchmarked functions will be organized into columns, while
inputs will be organized into rows. This is useful for situations where the
number of inputs is large, and the number of functions is small. This option
defaults to `false`.

Use the 'cycle' event to store results and build a table
after all BenchTable functions are evaluated for all inputs.

### `run(config)`
Runs the suite.

#### Params
- **Object** `config`: The options object. [See `benchmark.js` API docs.](http://benchmarkjs.com/docs#Suite_prototype_run)

### `addFunction(name, fun, options)`
Specify functions to be benchmarked.
This function may be called multiple times to add multiple functions.

#### Params
- **String** `name`: A name to identify the function.
- **Function** `fun`: The test to benchmark.
- **Object** `options`: The options object.

#### Return
- **BenchTable** The `BenchTable` instance.

### `addInput(name, input)`
Specify inputs for functions.
This function may be called multiple times to add multiple inputs.

#### Params
- **String** `name`: A name to identify the input.
- **Array** `input`: The array containing arguments that will be passed to each benchmarked function. Therefore, the number of
elements in the `input` array should match the number of arguments of
each specified function (i.e. the array will be "unpacked" when
invoking functions, they will not receive a single array argument).

#### Return
- **BenchTable** The `BenchTable` instance.

### Events

#### `complete`
Get results table.

After all benchmarks are finished, the `complete` event is fired and the `cli-table` table instance with the results is
available through the `BenchTable.prototype.table` property.

The ASCII string serialization of the table is obtained by calling `.toString()` on that object.

```js
var suite = new BenchTable();
...
suite.on('complete', () => {
  suite.table.toString();
});
```

## Examples

This is the Benchtable version of the example from the [Benchmark.js homepage](http://benchmarkjs.com).
Also available in the [examples directory](/examples/string_search.js).

### Default behavior

```js
// Import the benchtable module
var BenchTable = require('benchtable');

// Create benchtable suite
var suite = new BenchTable();

suite
  benchtable/ Add functions for benchmarking
    .addFunction('RegExp#test', s =benchtableo/.test(s))
    .addFunction('String#indexOf', s => s.indexOf('o') > -1)
  benchtable/ Add inputs
    .addInput('Short string', ['Hello world!'])
    .addInput('Long string', ['This is a very big string, isnt it? It is. Really. So, hello world!'])
    .addInput('Very long string', [`This is a ${new Array(100).join('very ')} + 'big string, isnt it? It is. ${new Array(100).join('Really. ')} So, hello world!`])
    .addInput('Extremely long string', [`This is a ${new Array(10000).join('very ')} + 'big string, isnt it? It is. ${new Array(10000).join('Really. ')} So, hello world!`])
  benchtable/ Add listeners
    .on('cycle', event => {
      console.log(event.target.toString());
    })
    .on('complete', () => {
      console.log('Fastest is ' + suite.filter('fastest').map('name'));
      console.log(suite.table.toString());
    })
  benchtable/ Run async
    .run({ async: false })
    ;

// =>
// RegExp#test for inputs Short string x 11,037,873 obenchtablesec ±0.57% (100 runs sampled)
// RegExp#test for inputs Long string x 10,114,587 obenchtablesec ±0.42% (100 runs sampled)
// RegExp#test for inputs Very long string x 7,534,743 obenchtablesec ±0.33% (101 runs sampled)
// RegExp#test for inputs Extremely long string x 304,666 obenchtablesec ±0.25% (101 runs sampled)
// String#indexOf for inputs Short string x 13,400,084 obenchtablesec ±0.28% (99 runs sampled)
// String#indexOf for inputs Long string x 12,947,759 obenchtablesec ±0.33% (100 runs sampled)
// String#indexOf for inputs Very long string x 8,489,440 obenchtablesec ±0.31% (101 runs sampled)
// String#indexOf for inputs Extremely long string x 306,018 obenchtablesec ±0.26% (100 runs sampled)
// Fastest is String#indexOf for inputs Short string
// +----------------+--------------------+--------------------+-------------------+-----------------------+
// |                │ Short string       │ Long string        │ Very long string  │ Extremely long string |
// +----------------+--------------------+--------------------+-------------------+-----------------------+
// | RegExp#test    │ 11,037,873 obenchtablesec │ 10,114,587 obenchtablesec │ 7,534,743 obenchtablesec │ 304,666 obenchtablesec       |
// +----------------+--------------------+--------------------+-------------------+-----------------------+
// | String#indexOf │ 13,400,084 obenchtablesec │ 12,947,759 obenchtablesec │ 8,489,440 obenchtablesec │ 306,018 obenchtablesec       |
// +----------------+--------------------+--------------------+-------------------+-----------------------+
```

## Transposed table

If the Benchtable object is initialized with the `{isTransposed : true}` option (see [this example](/examples/string_search_transposed.js)), the script produces the same output but with rows and columns transposed:

```js
...
var suite = new BenchTable('test', {isTransposed : true});
...
// =>
// RegExp#test for inputs Short string x 11,139,499 ops/sec ±0.56% (97 runs sampled)
// RegExp#test for inputs Long string x 10,370,952 ops/sec ±0.66% (97 runs sampled)
// RegExp#test for inputs Very long string x 7,386,009 ops/sec ±0.60% (98 runs sampled)
// RegExp#test for inputs Extremely long string x 297,936 ops/sec ±0.40% (99 runs sampled)
// String#indexOf for inputs Short string x 12,844,042 ops/sec ±0.44% (96 runs sampled)
// String#indexOf for inputs Long string x 12,474,178 ops/sec ±0.48% (98 runs sampled)
// String#indexOf for inputs Very long string x 8,471,914 ops/sec ±0.36% (94 runs sampled)
// String#indexOf for inputs Extremely long string x 301,176 ops/sec ±0.43% (93 runs sampled)
// Fastest is String#indexOf for inputs Short string
// +-----------------------+--------------------+--------------------+
// |                       │ RegExp#test        │ String#indexOf     |
// +-----------------------+--------------------+--------------------+
// | Short string          │ 11,139,499 ops/sec │ 12,844,042 ops/sec |
// +-----------------------+--------------------+--------------------+
// | Long string           │ 10,370,952 ops/sec │ 12,474,178 ops/sec |
// +-----------------------+--------------------+--------------------+
// | Very long string      │ 7,386,009 ops/sec  │ 8,471,914 ops/sec  |
// +-----------------------+--------------------+--------------------+
// | Extremely long string │ 297,936 ops/sec    │ 301,176 ops/sec    |
// +-----------------------+--------------------+--------------------+
```

## Contributing

Want to contribute to this project? See information [here](CONTRIBUTING.md).

## Credits
Benchtable is developed by [Ivan Zuzak](http://ivanzuzak.info) \<izuzak@gmail.com\>.

Benchtable is built with or uses many open-source projects:

 * [`cli-table`](https://github.com/LearnBoost/cli-table) - used for drawing ASCII tables
 * [`benchmark.js`](https://github.com/bestiejs/benchmark.js) - used for running benchmarks
 * [`color-it`](https://github.com/IonicaBizau/node-color-it/) - used for coloring of worst and best results in tables

## License

Licensed under the [Apache 2.0 License](/LICENSE.md).