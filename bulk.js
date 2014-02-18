var util = require('util'),
    Transform = require('stream').Transform;

module.exports = function(opts, cb) {
  return new BulkStream(opts, cb);
};

function BulkStream(opts, cb) {
  opts = opts || { size: 5 };
  Transform.call(this, opts);
  this.buffer = [];
  this.opts = opts;
  this.cb = cb;
}
util.inherits(BulkStream, Transform);
BulkStream.prototype._transform = function (chunk, encoding, done) {
  this.push(chunk);
  this.buffer.push(chunk);
  if (this.opts.size-1 < this.buffer.length) {
    this.cb(this.buffer);
    this.buffer = [];
  }
  done();
};
BulkStream.prototype._flush = function (fn) {
  console.log('flush', this.buffer.length);
  fn();
};
