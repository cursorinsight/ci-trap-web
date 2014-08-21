/* global module */

var MouseMoveHandler = function(element, state, buffer) {
"use strict";
// ---------------------------------------------------------------------------

var abs = Math.abs;

state.x = 0;
state.y = 0;

var handler = function(event) {
  var
    dX    = event.screenX - state.x,
    absDX = abs(dX),
    dY    = event.screenY - state.y,
    absDY = abs(dY),
    dT    = state.getDT(event, 20);

  state.x = event.screenX;
  state.y = event.screenY;

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
  element.addEventListener("mousemove", handler);
};

this.stop = function() {
  element.removeEventListener("mousemove", handler);
};

// ---------------------------------------------------------------------------
};

module.exports = MouseMoveHandler;
