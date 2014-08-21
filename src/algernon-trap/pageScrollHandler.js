/* global module */

var PageScrollHandler = function(element, state, buffer) {
"use strict";
// ---------------------------------------------------------------------------

var abs = Math.abs;

// Scroll X/Y on current page
// TODO initialize these with something more accurate (eg. a DOMContentLoaded
// or equivalent)
state.pX = 0;
state.pY = 0;

var handler = function(event) {
  var
    dX    = event.pageX - state.pX,
    absDX = abs(dX),
    dY    = event.pageY - state.pY,
    absDY = abs(dY),
    dT    = state.getDT(event, 20);

  state.pX = event.pageX;
  state.pY = event.pageY;

  // Small movements are stored in less space.
  if ((dT < 1024) && (absDX < 128) && (absDY < 128)) {
    buffer.push([4, dT, (dX < 0) ? 1 : 0, absDX, (dY < 0) ? 1 : 0, absDY],
                [4, 10,                1,     7,                1,     7]);
  } else {
    buffer.push([5, dT, (dX < 0) ? 1 : 0, (absDX > 0x7ff) ? 0x7ff : absDX, (dY < 0) ? 1 : 0, (absDY > 0x7ff) ? 0x7ff : absDY],
                [4, 20,                1,                              11,                1,                              11]);
  }

  return true;
};

this.start = function() {
  element.addEventListener("scroll", handler);
};

this.stop = function() {
  element.removeEventListener("scroll", handler);
};

// ---------------------------------------------------------------------------
};

module.exports = PageScrollHandler;
