/* global module */

var MouseButtonHandler = function(element, state, buffer) {
"use strict";
// ---------------------------------------------------------------------------

function button(event) {
  var bb = event.which ||
    function(b) {
      if (b === 4) { return 2; }
      else if (b === 2) { return 3; }
      else { return 1; }
    }(event.button);
  return bb;
}

var
  downEventName = "mousedown",
  upEventName = "mouseup",

  downHandler = function(event) {
    var dT = state.getDT(event, 20);
    buffer.push([2, dT, button(event)], [4, 20, 6]);
  },

  upHandler = function(event) {
    var dT = state.getDT(event, 20);
    buffer.push([3, dT, button(event)], [4, 20, 6]);
  };

this.start = function() {
  element.addEventListener(downEventName, downHandler);
  element.addEventListener(upEventName, upHandler);
};

this.stop = function() {
  element.removeEventListener(downEventName, downHandler);
  element.removeEventListener(upEventName, upHandler);
};

// ---------------------------------------------------------------------------
};

module.exports = MouseButtonHandler;
