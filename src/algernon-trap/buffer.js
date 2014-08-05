/* global module */

var Buffer = function() {
"use strict";
// ---------------------------------------------------------------------------

// @constant
var map  = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

// @constant
var head = "BA"; // v1

// 
this.buffer = head;

// DEBUG-ONLY
this.rawBuffer = [];

/**
 * Encodes and pushes values sampled by its given size into buffer.
 */
this.push = function(values, sizes) {
  // DEBUG-ONLY
  this.rawBuffer.push([values]);

  var idx,
    len = values.length,
    bc = 0,
    av = 0,
    size; // bc==bit counter, av=actual value

  for (idx = 0; idx < len; idx++) {
    size = sizes[idx];
    if (av > 0) {
      av = av << size;
    }
    av |= values[idx] & ((1 << size) - 1);
    bc += size;
    while (bc > 6) {
      bc -= 6;
      this.buffer += map[av >>> bc];
      av &= (1 << bc) - 1;
    }
  }

  this.buffer += map[av << (6 - bc)];

  return this.buffer;
};

/*
 * Shifts available data.
 */
this.shift = function() {
  var contents = this.buffer;
  this.reset();
  return contents;
};

this.reset = function() {
  // DEBUG-ONLY
  this.rawBuffer = [];

  this.buffer = head;

  return true;
};

// ---------------------------------------------------------------------------
};

module.exports = Buffer;
