/* global module */

// TODO: http://www.jacklmoore.com/notes/mouse-position/

var MouseMoveHandler = function(element, state, buffer) {
"use strict";
// ---------------------------------------------------------------------------

var
  abs = Math.abs,
  eventName = "mousemove",

  handler = function(event) {
    var
      dT    = state.getDT(event, 20),
      vX    = event.movementX || event.mozMovementX || event.webkitMovementX || null,
      absVX = vX ? abs(vX) : null,
      vY    = event.movementY || event.mozMovementY || event.webkitMovementY || null,
      absVY = vY ? abs(vY) : null,
      vSupport = typeof vX === "number";

    // Saving for next check
    state.sX = event.screenX;
    state.sY = event.screenY;

    // Saving for markers
    state.cX = event.clientX;
    state.cY = event.clientY;

    if (!vSupport) { // no browser-supported velocity
      buffer.push([0, dT, event.screenX, event.screenY, event.clientX, event.clientY],
                  [4, 20,            18,            18,            18,            18]);
    } else {
      buffer.push([1, dT, event.screenX, event.screenY, event.clientX, event.clientY, absVX, vX, absVY, vY],
                  [4, 20,            18,            18,            18,            18,     1, 11,     1, 11]);
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
