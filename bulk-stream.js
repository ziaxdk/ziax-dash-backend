var util = require('util'),
    Writable = require('stream').Writable;

module.exports = function(opts, cb) {
  return new BulkStream(opts, cb);
};

function BulkStream(opts, cb) {
  opts = opts || { size: 5 };
  Writable.call(this, opts);
  this.buffer = [];
  this.opts = opts;
  this.cb = cb;
}

util.inherits(BulkStream, Writable);
BulkStream.prototype._write = function (chunk, encoding, done) {
  this.buffer.push(chunk.toString());
  if (this.opts.size - 1 < this.buffer.length) {
    console.log('limit');
    this.cb(this.buffer, done);
    this.buffer = [];
    return;
  }
  done();
};
BulkStream.prototype.end = function (chunk, encoding, done) {
  this.cb(this.buffer, done);
};
