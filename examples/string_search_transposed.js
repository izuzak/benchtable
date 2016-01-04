// import module
// Import module
var BenchTable = require('../'); //require('benchtable');

// Create benchtable suite
var suite = new BenchTable("test", {isTransposed : true});

suite
    // Add functions for benchmarking
    .addFunction('RegExp#test', s => /o/.test(s))
    .addFunction('String#indexOf', s => s.indexOf('o') > -1)
    // Add inputs
    .addInput('Short string', ['Hello world!'])
    .addInput('Long string', ['This is a very big string, isnt it? It is. Really. So, hello world!'])
    .addInput('Very long string', [`This is a ${new Array(100).join("very ")} + 'big string, isnt it? It is. ${new Array(100).join("Really. ")} So, hello world!`])
    .addInput('Extremely long string', [`This is a ${new Array(10000).join("very ")} + 'big string, isnt it? It is. ${new Array(10000).join("Really. ")} So, hello world!`])
    // Add listeners
    .on('cycle', event => {
      console.log(event.target.toString());
    })
    .on('complete', () => {
      console.log('Fastest is ' + suite.filter('fastest').map('name'));
      console.log(suite.table.toString());
    })
    // Run async
    .run({ async: false })
    ;

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
