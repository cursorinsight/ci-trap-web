/* global module */

var Transport = function(window) {
"use strict";
// ---------------------------------------------------------------------------

// @constant
var map  = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

// @constant
var head = "BA"; // v1.1 :)

//
this.buffer = head;

// Locals.
var
  transport = this,

  url = "/v1",
  headers = {},
  counter = 1;

/*
 * @private
 * Shifts available data.  That means resetting to its defaults and returning
 * already collected events.
 */
function shift() {
  var contents = transport.buffer;
  transport.reset();
  return contents;
}

/**
 * Sends data to destination.
 */
this.send = function(sessionID, sync, callback) {
  var req;

  if (window.XMLHttpRequest) { // code for IE7+, Firefox, Chrome, Opera, Safari
    req = new window.XMLHttpRequest();
  } else { // code for IE6, IE5
    req = new window.ActiveXObject("Microsoft.XMLHTTP");
  }

  req.onreadystatechange = function() {
    if (callback){
      if ((req.readyState === 4) && (req.status === 200)) {
        callback(req);
      }
    }
  };

  req.open("POST", url, !sync);
  for (var key in headers) {
    if (headers.hasOwnProperty(key)) {
      req.setRequestHeader(key, headers[key]);
    }
  }

  // TODO make it configurable (enable/disable) w//o
  req.setRequestHeader("X-CI-Stream-ID", (sessionID ? sessionID : "") + "." + (counter++));
  req.setRequestHeader("Content-type", "application/octet-stream");
  req.send(shift());

  return true;
};

/**
 * Sets destination URL.
 */
this.setUrl = function(u) {
  url = u;
};

/**
 * Sets request header k/v pair.
 */
this.setHeader = function(key, value) {
  headers[key] = value;
};

/**
 * Encodes and pushes values sampled by its given size into buffer.
 */
this.push = function(values, sizes) {

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

this.reset = function() {
  this.buffer = head;
  return true;
};

// ---------------------------------------------------------------------------
};

module.exports = Transport;
