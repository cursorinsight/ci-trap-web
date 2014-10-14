/* global module */

var Transport = function(window) {
"use strict";
// ---------------------------------------------------------------------------

// @constant
var map  = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

// @constant
var head = "BB"; // v2 :)

// buffer
var buffer = "";

// Locals.
var
  encodeWrapper = window.encodeURIComponent,

  url = "/s",
  headers = {},
  counter = 1,
  sessionID,

  encodeValues = function(values, sizes) {
    var idx,
        len = values.length,
        bc = 0, // bit counter
        cv, // current value
        av = 0, // actual value
        size,
        results = "";

    for (idx = 0; idx < len; idx++) {
      cv = values[idx];
      size = sizes[idx];
      if (cv < 0) { cv = 0; }
      if (cv > ((2 << size) - 1)) { cv = ((2 << size) - 1); }
      if (av > 0) {
        av = av << size;
      }
      av |= cv & ((1 << size) - 1);
      bc += size;
      while (bc > 6) {
        bc -= 6;
        results += map[av >>> bc];
        av &= (1 << bc) - 1;
      }
    }

    results += map[av << (6 - bc)];

    return results;
  },

  encodeHeaders = function(headers) {
    var headerString = "";

    for (var key in headers) {
      if (headers.hasOwnProperty(key)) {
        headerString = headerString
          + encodeWrapper(key) + "="
          + encodeWrapper(headers[key]) + ",";
      }
    }

    return encodeValues([headerString.length], [12]) + headerString;
  };

/*
 * @private
 * Resets buffer.
 */
function reset() {
  buffer = "";
  return true;
}

/*
 * @private
 * Shifts available data.  That means resetting to its defaults and returning
 * already collected events.
 */
function shift() {
  var contents = buffer;
  reset();
  return contents;
}

/*
 * @private
 * Encodes raw bytes into stream format (length + URI encoded string
 * representation).
 */
function encodeRawBytes(bytes) {
  var encoded = encodeWrapper(bytes);
  return encodeValues([encoded.length], [12]) + encoded;
}

/**
 * Sends data to destination.
 */
this.send = function(sync, callback) {
  var
    req = new window.XMLHttpRequest(),
    onResponse = function() {
      if (callback){
        if ((req.readyState === 4) && (req.status === 200)) {
          callback(req);
        }
      }
    },
    onSuccess = function() {}, // TODO
    onFailure = function() {}; // TODO

  // TODO make it configurable (enable/disable) w//o
  headers["stream-id"] = (sessionID ? sessionID : "") + "." + (counter++);

  if ("withCredentials" in req) { // Is it a real XMLHttpRequest2 object
    req.open("POST", url, !sync);
    req.onreadystatechange = onResponse; // TODO XMLHttpRequest2 has onload and co...
    req.setRequestHeader("Content-type", "text/plain");
    // req.withCredentials = true;
  } else if (typeof window.XDomainRequest !== "undefined") { // XDomainRequest only exists in IE
    req = new window.XDomainRequest();
    req.onload = onSuccess;
    req.onerror = onFailure;
    req.contentType = "text/plain";
    req.open("POST", url);
  } else if (typeof window.ActiveXObject !== "undefined") { // Is it OK? :)
    req = new window.ActiveXObject("Microsoft.XMLHTTP");
    req.open("POST", url);
  } else {
    // TODO Firefox in test mode get to this branch
    req.open("POST", url, !sync);
    req.onload = onResponse;
    req.setRequestHeader("Content-type", "text/plain");
    //req = null;
    //throw new Error('CORS not supported'); // TODO
  }

  req.send(head + encodeHeaders(headers) + shift());

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
 * Sets session ID for this session.
 */
this.setSessionID = function(s) {
  sessionID = s;
};

/**
 * Returns current buffer contents (without version magic and headers).
 */
this.buffer = function() {
  return buffer;
};

/**
 * Encodes and pushes values sampled by its given size into buffer.
 */
this.push = function(values, sizes) {
  buffer += encodeValues(values, sizes);
  return buffer;
};

/**
 * Encodes raw bytes into stream format (length + URI encoded string
 * representation).
 */
this.encodeRawBytes = encodeRawBytes;

/**
 * Appends raw (encoded) bytes to buffer.
 */
this.pushRawBytes = function(bytes) {
  buffer += encodeRawBytes(bytes);
  return buffer;
};

/**
 * Resets buffer.
 */
this.reset = reset;

// ---------------------------------------------------------------------------
};

module.exports = Transport;
