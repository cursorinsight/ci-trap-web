/* global module */

var windowSizeHandler = function(window, state, buffer) {
"use strict";
// ---------------------------------------------------------------------------

var delay = 1000 / 15; // 15fps

var timeout;

function handler(event) {
  var
    w  = event.target.innerWidth,
    h  = event.target.innerHeight,
    dT = state.getDT(event, 20);

  buffer.push([8, dT,  w,  h],
              [4, 20, 15, 15]);
}

var throttler = function(event) {
  if (timeout) {
    window.clearTimeout(timeout);
  }

  timeout = window.setTimeout(function() {
    timeout = null;
    handler(event);
  }, delay);
};

this.start = function() {
  window.addEventListener("resize", throttler, false);
};

this.stop = function() {
  window.removeEventListener("resize", throttler, false);
};

// ---------------------------------------------------------------------------
};

module.exports = windowSizeHandler;
