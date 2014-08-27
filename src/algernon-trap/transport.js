/* global module */

var Transport = function(window) {
"use strict";
// ---------------------------------------------------------------------------

// @constant
var map  = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

// @constant
var head = "BA"; // v1.1 :)

//
this.buffer = "";

// Locals.
var
  transport = this,
  encodeWrapper = window.encodeURIComponent,

  url = "/s",
  headers = {},
  counter = 1,
  sessionID;

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
this.send = function(sync, callback) {
  var
    req = new window.XMLHttpRequest(),
    headerString = "",
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
  for (var key in headers) {
    if (headers.hasOwnProperty(key)) {
      // req.setRequestHeader(key, headers[key]);
      headerString = headerString
                     + encodeWrapper(key) + "="
                     + encodeWrapper(headers[key]) + ",";
    }
  }

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

  req.send(head + "," + headerString + shift());

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
 * Encodes and pushes values sampled by its given size into buffer.
 */
this.push = function(values, sizes) {

  var idx,
    len = values.length,
    bc = 0,
    cv, // current value
    av = 0,
    size; // bc==bit counter, av=actual value

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
      this.buffer += map[av >>> bc];
      av &= (1 << bc) - 1;
    }
  }

  this.buffer += map[av << (6 - bc)];

  return this.buffer;
};

this.reset = function() {
  this.buffer = "";
  return true;
};

// ---------------------------------------------------------------------------
};

module.exports = Transport;
