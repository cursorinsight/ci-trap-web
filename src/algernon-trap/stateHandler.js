/* global module */

var StateHandler = function(window, element, state, buffer) {
"use strict";
// ---------------------------------------------------------------------------

var
  /*
   * State event name (constant).
   */
  eventName = "at:state",

  /*
   * State event handler.
   */
  handler = function(event) {
    var
      dT = state.getDT(event, 20);

    buffer.push([15, dT, state.lastTs(),                      // 0b1111 <time-difference:20b> <current-time-stamp:42b>
                 state.mouseScreenX, state.mouseScreenY,      // <mouse-screen-x:18b> <mouse-screen-y:18b>
                 //state.cX, state.cY,                          // <mouse-client-x:18b> <mouse-client-y:18b>
                 state.pageScrollX, state.pageScrollY,        // <page-scroll-x(left):18b> <page-scroll-y(top):18b>
                 window.innerWidth, window.innerHeight,       // <inner-window-width:18b> <inner-window-height:18b>
                 window.outerWidth, window.outerHeight,       // <outer-window-width:18b> <outer-window-height:18b>
                 window.screenX || window.screenLeft,         // <window-position-left:18b>
                 window.screenY || window.screenTop,          // <window-position-top:18b>
                 window.screen.width, window.screen.height    // <screen-width:18b> <screen-height:18b>
                 ],
                [  4, 20, 42,
                  18, 18, // 18, 18,
                  18, 18, 18, 18,
                  18, 18, 18, 18,
                  18, 18]);
  };


var trigger = this.trigger = function() {
  var stateEvent = new window.Event(eventName);
  element.dispatchEvent(stateEvent);
};

this.start = function(options) {
  element.addEventListener(eventName, handler, false);
  if (options.initialState === true) {
    trigger();
  }
};

this.stop = function() {
  element.removeEventListener(eventName, handler);
};

// ---------------------------------------------------------------------------
};

module.exports = StateHandler;
