'use strict';

// config, should move this to some config
var stockfish = '/Users/john/projects/cpp/Stockfish/src/stockfish';
var nodeTest = '/Users/john/.nvm/versions/node/v7.4.0/bin/node';
var depth = 20;

var spawn = require('child_process').spawn;
var stream = require('stream');
var util = require('util');

// extend streamable object to get live output from child process
function EchoStream (resolver) {
  stream.Writable.call(this);
  this.resolver = resolver;
};
util.inherits(EchoStream, stream.Writable); // step 1
EchoStream.prototype._write = function (chunk, encoding, done) { // step 3
  var str = chunk.toString();
  console.log(str);
  if (str.indexOf('bestmove') > -1) {
    var index = str.indexOf('bestmove');
    this.resolver.resolve(str.substring(index, index+13));
    this.resolver.end();
  }
  done();
}

function getMove() {
  return new Promise( (resolve, reject) => {
    var child = spawn(stockfish);
    var myStream = new EchoStream({
      resolve:resolve,
      end: function() {
        child.stdin.end();
      }
    });

    child.stdout.pipe((myStream));

    child.stderr.on('data', function(data) {
        console.log('stderr: ' + data);
        reject(data);
    });
    child.on('close', function(code) {
        console.log('closing code: ' + code);
        
    });

    child.stdin.write('position startpos\n');
    child.stdin.write('go depth ' + depth + '\n');
    
  });
}

getMove().then((response) => {
  console.log('response:', response);
})