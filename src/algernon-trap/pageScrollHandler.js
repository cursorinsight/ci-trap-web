/* global module */

// TODO simplify/check this handler

var PageScrollHandler = function(element, state, buffer) {
"use strict";
// ---------------------------------------------------------------------------

var
  abs = Math.abs,
  eventName = "scroll",

  handler = function(event) {

    var pX, pY, dX, dY, signDX, signDY, absDX, absDY,

      dT = state.getDT(event, 20);

    // Scroll X/Y on current page
    if ("pageXOffset" in element && element.document) { // it's a window, or looks like a window
      var doc = element.document.documentElement;
      pX = (element.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
      pY = (element.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);
    } else { // fallback
      pX = event.pageX;
      pY = event.pageY;
    }

    dX     = pX - state.pX;
    signDX = dX < 0 ? 1 : 0;
    absDX  = abs(dX);
    dY     = pY - state.pY;
    signDY = dY < 0 ? 1 : 0;
    absDY  = abs(dY);

    state.pX = pX;
    state.pY = pY;

    // Small movements are stored in less space.
    if ((dT < 1024) && (absDX < 128) && (absDY < 128)) {
      buffer.push([4, dT, signDX, absDX, signDY, absDY],
                  [4, 10,      1,     7,      1,     7]);
    } else {
      buffer.push([5, dT, signDX, absDX, signDY, absDY],
                  [4, 20,      1,    11,      1,    11]);
    }

    return true;
  };

this.start = function() {

  // Scroll X/Y on current page
  if ("pageXOffset" in element && element.document) { // it's a window, or looks like a window
    var doc = element.document.documentElement;
    state.pX = (element.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
    state.pY = (element.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);
  } else { // fallback
    state.pX = 0;
    state.pY = 0;
  }

  element.addEventListener(eventName, handler);
};

this.stop = function() {
  element.removeEventListener(eventName, handler);
};

// ---------------------------------------------------------------------------
};

module.exports = PageScrollHandler;
