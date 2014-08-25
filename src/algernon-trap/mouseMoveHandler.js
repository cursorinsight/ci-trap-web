/* global module */

var MouseMoveHandler = function(element, state, buffer) {
"use strict";
// ---------------------------------------------------------------------------

var
  abs = Math.abs,
  eventName = "mousemove",

  handler = function(event) {
    var
      dX    = event.screenX - state.sX,
      absDX = abs(dX),
      dY    = event.screenY - state.sY,
      absDY = abs(dY),
      dT    = state.getDT(event, 20);

    // Saving for next check
    state.sX = event.screenX;
    state.sY = event.screenY;

    // Saving for markers
    state.cX = event.clientX;
    state.cY = event.clientY;

    // Small movements are stored in less space.
    if ((dT < 1024) && (absDX < 128) && (absDY < 128)) {
      buffer.push([0, dT, (dX < 0) ? 1 : 0, absDX, (dY < 0) ? 1 : 0, absDY],
                  [4, 10,                1,     7,                1,     7]);
    } else {
      buffer.push([1, dT, (dX < 0) ? 1 : 0, (absDX > 0x7ff) ? 0x7ff : absDX, (dY < 0) ? 1 : 0, (absDY > 0x7ff) ? 0x7ff : absDY],
                  [4, 20,                1,                              11,                1,                              11]);
    }

    return true;
  };

this.start = function() {

  // TODO: Something more accurate is needed.
  state.sX = 0;
  state.sY = 0;

  element.addEventListener(eventName, handler);
};

this.stop = function() {
  element.removeEventListener(eventName, handler);
};

// ---------------------------------------------------------------------------
};

module.exports = MouseMoveHandler;
