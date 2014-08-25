/* global module */

var mouseWheelHandler = function(element, state, buffer) {
"use strict";
// ---------------------------------------------------------------------------

var
  eventName = "wheel",

  handler = function(event) {
    var
      dT = state.getDT(event, 20);

    // console.log("wheeling", event);
  };

this.start = function() {
  element.addEventListener(eventName, handler);
};

this.stop = function() {
  element.removeEventListener(eventName, handler);
};

// ---------------------------------------------------------------------------
};

module.exports = mouseWheelHandler;
