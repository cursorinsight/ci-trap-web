/* global module */

var MarkerHandler = function(window, element, state, buffer) {
"use strict";
// ---------------------------------------------------------------------------

/*
 * Marker event name (constant).
 */
var
  eventName = "at:mark",
  defaultText = "marker",

  handler = function(event) {
    var
      dT   = state.getDT(event, 20),
      text = event && event.text || defaultText,
      encoded = window.encodeURIComponent(text);

    buffer.push([14, dT, encoded.length],
                [ 4, 20,             12]);
    buffer.pushRaw(encoded);
  };

this.start = function() {
  element.addEventListener(eventName, handler, false);
};

this.stop = function() {
  element.removeEventListener(eventName, handler);
};

// ---------------------------------------------------------------------------
};

module.exports = MarkerHandler;
