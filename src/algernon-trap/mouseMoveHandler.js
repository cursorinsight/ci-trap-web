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
      dT       = state.getDT(event, 20),
      vX       = event.movementX || event.mozMovementX || event.webkitMovementX || 0,
      signVX   = vX < 0 ? 1 : 0,
      vY       = event.movementY || event.mozMovementY || event.webkitMovementY || 0,
      signVY   = vY < 0 ? 1 : 0,
      vSupport = "movementX" in event || "mozMovementX" in event || "webkitMovementX" in event;

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
      buffer.push([1, dT, event.screenX, event.screenY, event.clientX, event.clientY, signVX, abs(vX), signVY, abs(vY)],
                  [4, 20,            18,            18,            18,            18,      1,      11,      1,      11]);
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
