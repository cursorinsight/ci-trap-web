/* global _att:true window document require */
/* Some snippets were copy-pasted from Piwik.js */

if (typeof _att !== "object") {
  _att = [];
}

(function(global, require, window, document) {
"use strict";
// ---------------------------------------------------------------------------

var
  // Constants
  cookieName = "CI-Browser-ID",
  headerName = "X-CI-Browser-ID",

  // Maximum delay to wait for sending data upon unload event
  delay = 300,

  // AlgernonTrap "class"
  AlgernonTrap = require("../../src/algernon-trap"),

  // Local tracker object
  tracker = new AlgernonTrap(document),

  // Cookies handler
  Cookies = require("./cookies.js"),
  cookies = new Cookies(window, document),

  // Helpers
  uuidV4 = function() {
    function p8(s) {
      var p = (Math.random().toString(16) + "000000000").substr(2,8);
      return s ? "-" + p.substr(0,4) + "-" + p.substr(4,4) : p ;
    }
    return p8() + p8(true) + p8(true) + p8();
  },

  // Browser ID
  browserID = cookies.getCookie(cookieName) || uuidV4(),

  // Session ID
  sessionID = uuidV4();

/*
 * apply wrapper
 *
 * @param array parameterArray An array comprising either:
 *      [ 'methodName', optional_parameters ]
 * or:
 *      [ functionObject, optional_parameters ]
 */
function apply() {
  var f, parameterArray;

  for (var i = 0; i < arguments.length; i += 1) {
    parameterArray = arguments[i];
    f = parameterArray.shift();

    if (typeof f === "string" || f instanceof String) {
      if (f === "setAccount") {
        parameterArray.unshift("X-CI-Account-ID");
        tracker.setHeader.apply(tracker, parameterArray);
      } else {
        tracker[f].apply(tracker, parameterArray);
      }
    } else {
     f.apply(tracker, parameterArray);
    }
  }
}

/*
 * Tracker proxy.
 */
function Proxy() {
  return {
    push: apply
  };
}

// apply the queue
for (var i2 = 0; i2 < _att.length; i2++) {
  if (_att[i2]) {
    apply(_att[i2]);
  }
}

// Set browser ID into tracker
tracker.setHeader(headerName, browserID);

// Set cookie accordingly
cookies.setCookie(cookieName, browserID);

// replace initialization array with proxy object
_att = new Proxy();

/*
 * Handle beforeunload event
 *
 * Subject to Safari's "Runaway JavaScript Timer" and
 * Chrome V8 extension that terminates JS that exhibits
 * "slow unload", i.e., calling getTime() > 1000 times
 */
function beforeUnloadHandler() {
  var now = new Date(),
    expireDateTime = now.getTime() + delay;

  tracker.send(sessionID);

  /*
   * Delay/pause (blocks UI)
   */
  // the things we do for backwards compatibility...
  // in ECMA-262 5th ed., we could simply use:
  // while (Date.now() < expireDateTime) { }
  do {
    now = new Date();
  } while (now.getTime() < expireDateTime);
}

window.addEventListener("beforeunload", beforeUnloadHandler, false);

// last but not least, start it...
tracker.start();

// ---------------------------------------------------------------------------
})(this, require, window, document);
