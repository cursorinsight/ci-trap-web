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
    absdX = abs(dX),
    dY    = event.screenY - state.y,
    absdY = abs(dX),
    dT    = event.timeStamp - state.t;

  state.x = event.screenX;
  state.y = event.screenY;
  state.t = event.timeStamp;

  // Small movements are stored in less space.
  if ((dT < 1024) && (absdX < 32) && (absdY < 32)) {
    buffer.push([0, dT, (dX < 0) ? 1 : 0, absdX, (dY < 0) ? 1 : 0, absdY],
                [2, 10,                1,     5,                1,     5]);
  } else {
    buffer.push([1, (dT > 0xffff) ? 0xffff : dT, (dX < 0) ? 1 : 0, (absdX > 0x7ff) ? 0x7ff : absdX, (dY < 0) ? 1 : 0, (absdY > 0x7ff) ? 0x7ff : absdY],
                [2,                          16,                1,                              11,                1,                              11]);
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
