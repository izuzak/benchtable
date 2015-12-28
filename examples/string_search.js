// import module
var BenchTable = require('../'); //require('benchtable');

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
