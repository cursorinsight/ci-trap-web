/* global module */

var MouseButtonHandler = function(element, state, buffer) {
"use strict";
// ---------------------------------------------------------------------------

var handler = function(event) {
  var
    type,
    dT = event.timeStamp - state.t;

  state.t = event.timeStamp;

  // We prepare this for other event types (eg. touch, swipe, ...).
  switch (event.type) {
    case "mousedown":
      type = 2; // down
      break;

    case "mouseup":
      type = 3; // up
      break;
  }


  buffer.push([type, dT > 0xffff ? 0xffff : dT], [2, 16]);

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
