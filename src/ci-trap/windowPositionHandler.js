/* global module */

var WindowPositionHandler = function(window, document, state, buffer) {
"use strict";
// ---------------------------------------------------------------------------

var
  eventName = "positionchanged",
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

  handler = function(event) {
    var dT = state.getDT(null, 20);

    state.windowPositionX = event.x;
    state.windowPositionY = event.y;

    // type = 0b1001
    buffer.push([9, dT, event.x, event.y],
                [4, 20,      15,      15]);
  },

  poller = function() {
    var
      x = windowPositionX(),
      y = windowPositionY();

    if (state.windowPositionX !== x || state.windowPositionY !== y) {
      var event = document.createEvent("CustomEvent");
      event.initEvent(eventName, true, false);
      event.x = x;
      event.y = y;
      window.dispatchEvent(event);

      throttleCount = throttleBase;
    }

    if (throttleCount > 0) {
      throttleCount--;
      timeout = window.setTimeout(poller, shortDelay);
    } else {
      timeout = window.setTimeout(poller, longDelay);
    }
  },

  startPoller = function() {
    window.setTimeout(poller, longDelay);
  },

  stopPoller = function() {
    if (timeout) {
      window.clearTimeout(timeout);
    }
  };

this.start = function() {
  state.windowPositionX = windowPositionX();
  state.windowPositionY = windowPositionY();
  window.addEventListener(eventName, handler, false);
  startPoller();
};

this.stop = function() {
  stopPoller();
  window.removeEventListener(eventName, handler, false);
};

// ---------------------------------------------------------------------------
};

module.exports = WindowPositionHandler;
