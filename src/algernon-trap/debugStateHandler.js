/* global module */

var MarkerHandler = function(window, element, state, buffer) {
"use strict";
// ---------------------------------------------------------------------------

var
  /*
   * Debug event name (constant).
   */
  eventName = "at:debug",

  /*
   * Debug event handler.
   */
  handler = function(event) {
    var
      dT = state.getDT(event, 20);

//    console.log(eventName,
//        element,
//        "dT", dT,
//        "timeStamp", state.lastTs(),
//        "screen", state.sX, state.sY,
//        "client", state.cX, state.cY,
//        "scroll", state.pX, state.pY,
//        "window", state.wW, state.wH
//    );

    buffer.push([15, dT, state.lastTs(), state.sX, state.sY, state.cX, state.cY, state.pX, state.pY, state.wW, state.wH],
                [ 4, 20,             42,       18,       18,       18,       18,       18,       18,       18,       18]);
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
