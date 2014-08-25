/* global module */

var MouseButtonHandler = function(element, state, buffer) {
"use strict";
// ---------------------------------------------------------------------------

var
  downEventName = "mousedown",
  upEventName = "mouseup",

  downHandler = function(event) {
    var dT = state.getDT(event, 20);
    buffer.push([2, dT], [4, 20]);
  },

  upHandler = function(event) {
    var dT = state.getDT(event, 20);
    buffer.push([3, dT], [4, 20]);
  };

this.start = function() {
  element.addEventListener(downEventName, downHandler);
  element.addEventListener(upEventName, upHandler);
};

this.stop = function() {
  element.removeEventListener(downEventName, downHandler);
  element.removeEventListener(upEventName, upHandler);
};

// ---------------------------------------------------------------------------
};

module.exports = MouseButtonHandler;
