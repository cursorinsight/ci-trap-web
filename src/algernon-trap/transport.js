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

  url = "/v1",
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
    headerString = "";

  if (!("withCredentials" in req)) { // Is it a real XMLHttpRequest2 object
    if (typeof window.XDomainRequest !== "undefined") { // XDomainRequest only exists in IE
      req = new window.XDomainRequest();
    } else if (typeof window.ActiveXObject !== "undefined") { // Is it OK? :)
      req = new window.ActiveXObject("Microsoft.XMLHTTP");
    } else {
      // TODO on Firefox tests this one is run
      //req = null;
      //throw new Error('CORS not supported'); // TODO
    }
  }

  req.onreadystatechange = function() {
    if (callback){
      if ((req.readyState === 4) && (req.status === 200)) {
        callback(req);
      }
    }
  };

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

  req.open("POST", url, !sync);
  req.setRequestHeader("Content-type", "text/plain");
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
  this.buffer = "";
  return true;
};

// ---------------------------------------------------------------------------
};

module.exports = Transport;
