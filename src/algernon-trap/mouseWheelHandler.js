/* global module */

var mouseWheelHandler = function(element, state, buffer) {
"use strict";
// ---------------------------------------------------------------------------

var handler = function(event) {
  var
    dT = state.getDT(event, 20);

  // console.log("wheeling", event);
};

this.start = function() {
  element.addEventListener("wheel", handler);
};

this.stop = function() {
  element.removeEventListener("wheel", handler);
};

// ---------------------------------------------------------------------------
};

module.exports = mouseWheelHandler;
