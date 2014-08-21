/* global module */

var MouseButtonHandler = function(element, state, buffer) {
"use strict";
// ---------------------------------------------------------------------------

var handler = function(event) {
  var
    type,
    dT = state.getDT(event, 20);

  // We prepare this for other event types (eg. touch, swipe, ...).
  switch (event.type) {
    case "mousedown":
      type = 2; // down
      break;

    case "mouseup":
      type = 3; // up
      break;
  }


  buffer.push([type, dT], [4, 20]);

  return true;
};

this.start = function() {
  element.addEventListener("mousedown", handler);
  element.addEventListener("mouseup", handler);
};

this.stop = function() {
  element.removeEventListener("mousedown", handler);
  element.removeEventListener("mouseup", handler);
};

// ---------------------------------------------------------------------------
};

module.exports = MouseButtonHandler;
