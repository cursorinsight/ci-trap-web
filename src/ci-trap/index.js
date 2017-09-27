/*! ci-trap v0.2.0 - MIT license */
/* global module require window */

/*
 * Motion event (mouse movement) catcher for browsers emitting data compatible
 * with Cursor Insight's motion analyzer engine. (touch, gyro, etc. is WIP)
 *
 * Copyright (c) 2012--2014, GOLDA Bence <gbence@algernon.hu>
 *                     2014, GOLDA Bence <bence@cursorinsight.com>
 *                     2014, TÖRTELI Olivér <oliver@cursorinsight.com>
 *
 * # Data format (in ~BNF) ##########################################
 *
 *    <data> ::= <version> <headers> <events>
 * <headers> ::= <header-size:12b> <url-encoded-string:<header-size in bytes>>
 *  <events> ::= <event> <events> | EOS
 *   <event> ::= <mouse-move> | <mouse-button>
 *             | <touch-move> | <touch-change>
 *             | <scroll-change>
 *             | <mouse-wheel-x> | <mouse-wheel-y>
 *             | <window-size-change> | <window-position-change>
 *             | <visibility-change> | <unload>
 *             | <marker> | <state>
 *
 * // this is (and will be) always a constant and a version id
 * <version>        ::= "B" <version-letter>
 * <version-letter> ::= "A" | "B" | "C" | "D" ...
 *
 * // sum: 60b
 * <mouse-move> ::= 0b0000 <time-difference:20b>
 *                  <mouse-screen-x:18b> <mouse-screen-y:18b>
 *
 * <touch-move> ::= 0b0001 <time-difference:20b>
 *                  <empty:1b> <touch-id:5b>
 *                  <touch-screen-x:18b> <touch-screen-y:18b>
 *
 * TODO: return only the differences and put "markers" (as full frames in
 * video) into the stream
 *
 * // sum: 66b
 * <mouse-button> ::= 0b0010 <time-difference:20b>
 *                    <button-state:1b> <button-definition:5b> // button-state == 1 for "down", == 0 for "up"
 *                    // <mouse-screen-x:18b> <mouse-screen-y:18b>
 *
 * <touch-change> ::= 0b0011 <time-difference:20b>
 *                    <touch-state:1b> <touch-id:5b> // touch-state == 1 for "down"/"start", == 0 for "up"/"end"
 *                    <touch-screen-x:18b> <touch-screen-y:18b>
 *
 * // sum: 48b
 * <scroll-change> ::= 0b0100 <time-difference:20b>
 *                     <sign-of-dx:1b> <abs-dx:11b>
 *                     <sign-of-dy:1b> <abs-dy:11b>
 *
 * // sum: 36b
 * <mouse-wheel-x> ::= 0b0110 <time-difference:20b>
 *                     <sign-of-d:1b> <abs-d:11b>
 *
 * // sum: 36b
 * <mouse-wheel-y> ::= 0b0111 <time-difference:20b>
 *                     <sign-of-d:1b> <abs-d:11b>
 *
 * // sum: 54b
 * <window-size-change> ::= 0b1000 <time-difference:20b>
 *                          <inner-window-width:15b> <inner-window-height:15b>
 *
 * // sum: 54b
 * <window-position-change> ::= 0b1001 <time-difference:20b>
 *                              <window-position-left:15b> <window-position-top:15b>
 *
 * // sum: 24b
 * <visibility-change> ::= 0b1010 <time-difference:20b> // (visible/focused)
 * <visibility-change> ::= 0b1011 <time-difference:20b> // (hidden/idle)
 *
 * // sum: 24b
 * <unload> ::= 0b1100 <time-difference:20b>
 *
 * // sum: variable
 * <marker> ::= 0b1110 <time-difference:20b>
 *              <size:12b> <url-encoded-string:<size in bytes>>
 *
 * // sum: 4+20+42+(12*18) = 282b
 * <state> ::= 0b1111 <time-difference:20b>
 *             <current-time-stamp:42b>
 *             <mouse-screen-x:18b> <mouse-screen-y:18b>
 *             // <mouse-client-x:18b> <mouse-client-y:18b> // temporarily disabled
 *             <page-scroll-x(left):18b> <page-scroll-top-y(top):18b>
 *             <inner-window-width:18b> <inner-window-height:18b>
 *             <outer-window-width:18b> <outer-window-height:18b>
 *             <window-position-left:18b> <window-position-top:18b>
 *             <screen-width:18b> <screen-height:18b>
 *
 * JsDoc keyword:
 * https://code.google.com/p/jsdoc-toolkit/wiki/TagReference
 *
 * @link ClassName#CITrap
 */

(function(/* global */){function moduleDefinition(/*wheelShim*/) { // dependency1, dependency2...
"use strict";
// ---------------------------------------------------------------------------

/**
 * @constructor CITrap
 * @param {String} element Html element which will be watched
 * @return {Function} Return CITrap, it will be the module
 */
function CITrap(element, idleTimeout) {

  var
    windowAlias = window,
    documentAlias = window.document,
    undefinedAlias;

  // Set up defaults.
  if (element === undefinedAlias) {
    element = documentAlias;
  }

  var

    windowSupport = (element === windowAlias || element === documentAlias),
    touchSupport = "ontouchstart" in windowAlias ||    // works on most browsers
                   "onmsgesturechange" in windowAlias, // works on ie10

    // master loop
    running = false,

    // Buffer + transport
    Transport = require("./transport.js"),
    transport = new Transport(windowAlias),

    // State
    State = require("./state.js"),
    state = new State(windowAlias, transport, idleTimeout),

    // Handlers
    handlers = new Array(state),

    StateHandler = require("./stateHandler.js"),
    MarkerHandler = require("./markerHandler.js"),
    MouseMoveHandler = require("./mouseMoveHandler.js"),
    MouseButtonHandler = require("./mouseButtonHandler.js"),
    PageScrollHandler = require("./pageScrollHandler.js"),
    //MouseWheelHandler = require("./mouseWheelHandler.js");

    markerHandler = new MarkerHandler(windowAlias, documentAlias, element, state, transport);

  handlers.push(new StateHandler(windowAlias, documentAlias, element, state, transport));
  handlers.push(markerHandler);
  handlers.push(new MouseMoveHandler(element, state, transport));
  handlers.push(new MouseButtonHandler(element, state, transport));

  // IE 6, 7, 8 does not support scroll event on document
  // http://www.quirksmode.org/dom/events/scroll.html
  handlers.push(new PageScrollHandler(element === documentAlias ? windowAlias : element, state, transport));

  // handlers.push(new MouseWheelHandler(element, state, transport));

  if (windowSupport) {
    var
      WindowSizeHandler = require("./windowSizeHandler.js"),
      WindowPositionHandler = require("./windowPositionHandler.js"),
      WindowUnloadHandler = require("./windowUnloadHandler.js"),
      VisibilityChangeHandler = require("./visibilityChangeHandler.js");
    handlers.push(new WindowSizeHandler(windowAlias, state, transport));
    handlers.push(new WindowPositionHandler(windowAlias, documentAlias, state, transport));
    handlers.push(new WindowUnloadHandler(windowAlias, state, transport));
    handlers.push(new VisibilityChangeHandler(windowAlias, state, transport));
  }

  if (touchSupport) {
    var TouchHandler = require("./touchHandler.js");
    handlers.push(new TouchHandler(element, state, transport));
  }

  /*
   * Public methods
   */
  return {

    /**
     *  Starts event processing.
     */
    start: function(options) {
      if (running) {
        return;
      }
      options = options || {};
      var length = handlers.length, i = 0;
      for (;i < length; i++) {
        if((handlers[i] !== undefinedAlias) && (typeof handlers[i].start === "function")) {
          handlers[i].start(options);
        }
      }
      running = true;
    },

    /**
     *  Stops event processing.
     */
    stop: function() {
      if (!running) {
        return;
      }
      var length = handlers.length, i = 0;
      for (;i < length; i++) {
        if((handlers[i] !== undefinedAlias) && (typeof handlers[i].stop === "function")) {
          handlers[i].stop();
        }
      }
      running = false;
    },

    buffer: function() {
      return transport.buffer();
    },

    // TODO make this "readonly"
    element: element,

    send: function() {
      return transport.send.apply(this, arguments);
    },

    setHeader: function() {
      return transport.setHeader.apply(this, arguments);
    },

    setUrl: function() {
      return transport.setUrl.apply(this, arguments);
    },

    setSessionID: function() {
      return transport.setSessionID.apply(this, arguments);
    },

    mark: function(text) {
      if (markerHandler) {
        markerHandler.trigger(text);
      }
    }

  };
}

/**
 * Expose CITrap
 */

return CITrap;

// ---------------------------------------------------------------------------
}

module.exports = moduleDefinition(/*require("../vendor/mdn-wheel.js")*/);

}(this));
