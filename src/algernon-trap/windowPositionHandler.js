/* global module */

var windowPositionHandler = function(window, state, buffer) {
"use strict";
// ---------------------------------------------------------------------------

var
  longDelay = 1000 / 2, // 2fps
  shortDelay = 1000 / 15, // 15fps
  throttleBase = 15, // it's a "constant"
  throttleCount = throttleBase,
  timeout,

  windowPositionX = function() {
    return window.screenX || window.screenLeft || 0;
  },

  windowPositionY = function() {
    return window.screenY || window.screenTop || 0;
  },

  handler = function() {
    var
      x = windowPositionX(),
      y = windowPositionY(),
      dT = state.getDT(null, 20);

    if (state.windowPositionX !== x || state.windowPositionY !== y) {

      state.windowPositionX = x;
      state.windowPositionY = y;

      // type = 0b1001
      buffer.push([9, dT,  x,  y],
                  [4, 20, 15, 15]);

      throttleCount = throttleBase;
    }

    if (throttleCount > 0) {
      throttleCount--;
      timeout = window.setTimeout(handler, shortDelay);
    } else {
      timeout = window.setTimeout(handler, longDelay);
    }

  };

this.start = function() {
  state.windowPositionX = windowPositionX();
  state.windowPositionY = windowPositionY();
  handler();
};

this.stop = function() {
  if (timeout) {
    window.clearTimeout(timeout);
  }
};

// ---------------------------------------------------------------------------
};

module.exports = windowPositionHandler;
