// Import module
var BenchTable = require('../'); //require('benchtable');

// Create benchtable suite
var suite = new BenchTable();

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
      console.log('Fastest is ' + suite.filter('fastest').pluck('name'));
      console.log(suite.table.toString());
    })
    // Run async
    .run({ 'async': false })
    ;

// =>
// RegExp#test for inputs Short string x 11,037,873 ops/sec ±0.57% (100 runs sampled)
// RegExp#test for inputs Long string x 10,114,587 ops/sec ±0.42% (100 runs sampled)
// RegExp#test for inputs Very long string x 7,534,743 ops/sec ±0.33% (101 runs sampled)
// RegExp#test for inputs Extremely long string x 304,666 ops/sec ±0.25% (101 runs sampled)
// String#indexOf for inputs Short string x 13,400,084 ops/sec ±0.28% (99 runs sampled)
// String#indexOf for inputs Long string x 12,947,759 ops/sec ±0.33% (100 runs sampled)
// String#indexOf for inputs Very long string x 8,489,440 ops/sec ±0.31% (101 runs sampled)
// String#indexOf for inputs Extremely long string x 306,018 ops/sec ±0.26% (100 runs sampled)
// Fastest is String#indexOf for inputs Short string
// +----------------+--------------------+--------------------+-------------------+-----------------------+
// |                │ Short string       │ Long string        │ Very long string  │ Extremely long string |
// +----------------+--------------------+--------------------+-------------------+-----------------------+
// | RegExp#test    │ 11,037,873 ops/sec │ 10,114,587 ops/sec │ 7,534,743 ops/sec │ 304,666 ops/sec       |
// +----------------+--------------------+--------------------+-------------------+-----------------------+
// | String#indexOf │ 13,400,084 ops/sec │ 12,947,759 ops/sec │ 8,489,440 ops/sec │ 306,018 ops/sec       |
// +----------------+--------------------+--------------------+-------------------+-----------------------+
