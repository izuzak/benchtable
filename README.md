# Benchtable

Benchtable is a NodeJS module which provides an easy way to run performance tests for a set of JavaScript functions on a set of inputs, and display the evaluation results as an ASCII table.

This is useful for situations when you are:

 * evaluating the performance of a single function for a range of inputs (e.g. of different size)
 * comparing the performance of a set of functions for a specific input (e.g. different implementations of same functionality)
 * comparing the performance of a set of functions for the same set of inputs

Benchtable is not a new JavaScript benchmarking framework -- it extends the already excellent [benchmark.js](https://github.com/bestiejs/benchmark.js) framework.
Benchmarks are executed using benchmark.js and displayed using [cli-table](https://github.com/LearnBoost/cli-table).

![Screenshot](https://raw.github.com/izuzak/benchtable/master/screenshot.png)

## Features

 * a Benchtable suite is an extension (subclass) of the [Benchmark.js Suite API](http://benchmarkjs.com/docs#Suite)
 * a simple API for defining benchmarks functions and inputs
 * display of benchmarking results as an ASCII table, with ops/sec measure used for table data
 * simple visual identification of functions with best and worst performance for each input using color highlighting (red = worst, green = best)

## Installation

```bash
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

### `run(name, fun, options)`
addFunction
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
available through the `Benchtable.prototype.table` property.

The ASCII string serialization of the table is obtained by calling `.toString()` on that object.

```js
var suite = new BenchTable();
...
suite.on('complete', () => {
  suite.table.toString();
});
```

## Example

This is the Benchtable version of the example from the [Benchmark.js homepage](http://benchmarkjs.com).
Also available in the [examples directory](/examples/string_search.js).

```js
// import module
var BenchTable = require('benchtable'); //require('benchtable');

// create benchtable suite
var suite = new BenchTable();

// add functions for benchmarking
suite.addFunction('RegExp#test', function(s) { /o/.test(s) })
.addFunction('String#indexOf', function(s) {s.indexOf('o') > -1;})

// add inputs
.addInput('Short string', ['Hello world!'])
.addInput('Long string', ['This is a very big string, isnt it? It is. Really. So, hello world!'])
.addInput('Very long string', ['This is a ' + new Array(100).join("very ") + 'big string, isnt it? It is. ' + new Array(100).join("Really. ") + 'So, hello world!'])
.addInput('Extremely long string', ['This is a ' + new Array(10000).join("very ") + 'big string, isnt it? It is. ' + new Array(10000).join("Really. ") + 'So, hello world!'])

// add listeners
.on('cycle', function(event) {
  console.log(String(event.target));
})
.on('complete', function() {
  console.log('Fastest is ' + this.filter('fastest').pluck('name'));
  console.log(this.table.toString());
})

// run async
.run({ 'async': false });

/*

Produces output:

  RegExp#test for params Short string x 6,543,445 ops/sec ±0.48% (98 runs sampled)
  RegExp#test for params Long string x 5,059,970 ops/sec ±0.28% (98 runs sampled)
  RegExp#test for params Very long string x 950,524 ops/sec ±0.44% (98 runs sampled)
  RegExp#test for params Extremely long string x 11,309 ops/sec ±0.42% (99 runs sampled)
  String#indexOf for params Short string x 8,976,449 ops/sec ±0.34% (99 runs sampled)
  String#indexOf for params Long string x 6,360,103 ops/sec ±0.29% (99 runs sampled)
  String#indexOf for params Very long string x 979,404 ops/sec ±0.40% (100 runs sampled)
  String#indexOf for params Extremely long string x 11,266 ops/sec ±0.39% (98 runs sampled)
  Fastest is String#indexOf for params Short string
  +----------------+-------------------+-------------------+------------------+-----------------------+
  |                | Short string      | Long string       | Very long string | Extremely long string |
  +----------------+-------------------+-------------------+------------------+-----------------------+
  | RegExp#test    | 6,543,445 ops/sec | 5,059,970 ops/sec | 950,524 ops/sec  | 11,309 ops/sec        |
  +----------------+-------------------+-------------------+------------------+-----------------------+
  | String#indexOf | 8,976,449 ops/sec | 6,360,103 ops/sec | 979,404 ops/sec  | 11,266 ops/sec        |
  +----------------+-------------------+-------------------+------------------+-----------------------+

*/
```

When executed as `node ./examples/string_search.js`, the script produces output:

```
RegExp#test for params Short string x 6,543,445 ops/sec �0.48% (98 runs sampled)
RegExp#test for params Long string x 5,059,970 ops/sec �0.28% (98 runs sampled)
RegExp#test for params Very long string x 950,524 ops/sec �0.44% (98 runs sampled)
RegExp#test for params Extremely long string x 11,309 ops/sec �0.42% (99 runs sampled)
String#indexOf for params Short string x 8,976,449 ops/sec �0.34% (99 runs sampled)
String#indexOf for params Long string x 6,360,103 ops/sec �0.29% (99 runs sampled)
String#indexOf for params Very long string x 979,404 ops/sec �0.40% (100 runs sampled)
String#indexOf for params Extremely long string x 11,266 ops/sec �0.39% (98 runs sampled)
Fastest is String#indexOf for params Short string
+----------------+-------------------+-------------------+------------------+-----------------------+
|                | Short string      | Long string       | Very long string | Extremely long string |
+----------------+-------------------+-------------------+------------------+-----------------------+
| RegExp#test    | 6,543,445 ops/sec | 5,059,970 ops/sec | 950,524 ops/sec  | 11,309 ops/sec        |
+----------------+-------------------+-------------------+------------------+-----------------------+
| String#indexOf | 8,976,449 ops/sec | 6,360,103 ops/sec | 979,404 ops/sec  | 11,266 ops/sec        |
+----------------+-------------------+-------------------+------------------+-----------------------+
```

If the Benchtable object is initialized with the `{isTransposed : true}` option (see [this example](https://github.com/izuzak/benchtable/examples/string_search_transposed.js)), the script produces the same output but with rows and columns transposed:

```
RegExp#test for inputs Short string x 7,011,480 ops/sec �0.69% (91 runs sampled)
RegExp#test for inputs Long string x 4,720,734 ops/sec �2.53% (91 runs sampled)
RegExp#test for inputs Very long string x 952,009 ops/sec �0.88% (97 runs sampled)
RegExp#test for inputs Extremely long string x 11,542 ops/sec �0.28% (98 runs sampled)
String#indexOf for inputs Short string x 9,494,499 ops/sec �0.45% (93 runs sampled)
String#indexOf for inputs Long string x 6,686,112 ops/sec �0.41% (101 runs sampled)
String#indexOf for inputs Very long string x 984,418 ops/sec �1.10% (97 runs sampled)
String#indexOf for inputs Extremely long string x 11,136 ops/sec �1.14% (97 runs sampled)
Fastest is String#indexOf for inputs Short string
+-----------------------+-------------------+-------------------+
|                       | RegExp#test       | String#indexOf    |
+-----------------------+-------------------+-------------------+
| Short string          | 7,011,480 ops/sec | 9,494,499 ops/sec |
+-----------------------+-------------------+-------------------+
| Long string           | 4,720,734 ops/sec | 6,686,112 ops/sec |
+-----------------------+-------------------+-------------------+
| Very long string      | 952,009 ops/sec   | 984,418 ops/sec   |
+-----------------------+-------------------+-------------------+
| Extremely long string | 11,542 ops/sec    | 11,136 ops/sec    |
+-----------------------+-------------------+-------------------+
```

## Contributing

Want to contribute to this project? See information [here](CONTRIBUTING.md).

## Credits
Benchtable is developed by [Ivan Zuzak](http://ivanzuzak.info) \<izuzak@gmail.com\>;.

Benchtable is built with or uses many open-source projects:
 * [`cli-table`](https://github.com/LearnBoost/cli-table) - used for drawing ASCII tables
 * [`benchmark.js`](https://github.com/bestiejs/benchmark.js) - used for running benchmarks
 * [`colors`](https://github.com/marak/colors.js/) - used for coloring of worst and best results in tables

## License

Licensed under the [Apache 2.0 License](https://github.com/izuzak/benchtable/blob/master/LICENSE.md).