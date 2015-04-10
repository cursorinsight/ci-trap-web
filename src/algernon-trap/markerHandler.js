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
      text = event && event.text || defaultText;

    buffer.push([14, dT],
                [ 4, 20]);
    buffer.pushRawBytes(text);
  };

this.trigger = function(text) {
  var markEvent = document.createEvent("CustomEvent");
  markEvent.initEvent(eventName, true, false);
  markEvent.text = text || "mark";
  element.dispatchEvent(markEvent);
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
