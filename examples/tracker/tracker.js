/* global _att:true window document require */
/* Some snippets were copy-pasted from Piwik.js */

if (typeof _att !== "object") {
  _att = [];
}

(function(global, require, window, document) {
"use strict";
// ---------------------------------------------------------------------------

var
  // Maximum delay to wait for sending data upon unload event
  delay = 2500,

  // Local tracker object
  tracker,

  // AlgernonTrap "class"
  AlgernonTrap = require("../../src/algernon-trap");

/*
 * Handle beforeunload event
 *
 * Subject to Safari's "Runaway JavaScript Timer" and
 * Chrome V8 extension that terminates JS that exhibits
 * "slow unload", i.e., calling getTime() > 1000 times
 */
function beforeUnloadHandler() {
  tracker.send(undefined, true); // that's a synchronuous call
}

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
        parameterArray.unshift("X-CIA-ID");
        tracker.setHeader.apply(tracker, parameterArray);
      } else {
        tracker[f].apply(tracker, parameterArray);
      }
    }
    // else {
    //  f.apply(tracker, parameterArray);
    // }
  }
}

function Proxy() {
  return {
    push: apply
  };
}

tracker = new AlgernonTrap(document);

window.addEventListener("beforeunload", beforeUnloadHandler, false);

// apply the queue
for (var i2 = 0; i2 < _att.length; i2++) {
  if (_att[i2]) {
    apply(_att[i2]);
  }
}

// replace initialization array with proxy object
_att = new Proxy();

// last but not least, start it...
tracker.start();

// ---------------------------------------------------------------------------
})(this, require, window, document);
