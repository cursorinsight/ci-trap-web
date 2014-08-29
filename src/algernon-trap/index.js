/*! algernon-trap v0.1.0 - MIT license */
/* global module require window */

/*
 * Motion event (mouse movement) catcher for browsers emitting data compatible
 * with Algernon's motion analyzer engine. (touch, gyro, etc. is WIP)
 *
 * Copyright (c) 2012--2014, GOLDA Bence <gbence@algernon.hu>
 *                     2014, GOLDA Bence <bence@cursorinsight.com>
 *                     2014, TÖRTELI Olivér <oliver@cursorinsight.com>
 *
 * # Data format (in BNF) ###########################################
 *
 *    <data> ::= <version> <events>
 *  <events> ::= <event> <events> | EOS
 *   <event> ::= <mouse-move-short> | <mouse-move-long>
 *             | <mouse-button-down> | <mouse-button-up>
 *             | <scroll-change-short> | <scroll-change-long>
 *             | <mouse-wheel-x> | <mouse-wheel-y>
 *             | <window-size-change>
 *             | <marker> | <state>
 *
 * // this is (and will be) always a constant and a version id
 * <version>        ::= "B" <version-letter>
 * <version-letter> ::= "A" | "B" | "C" | "D" ...
 *
 * <mouse-move-simple> ::= 0b0000 <time-difference:20b>
 *                         <mouse-screen-x:18b> <mouse-screen-y:18b>
 *                         <mouse-client-x:18b> <mouse-client-y:18b>
 *
 * <mouse-move-extended> ::= 0b0001 <time-difference:20b>
 *                           <mouse-screen-x:18b> <mouse-screen-y:18b>
 *                           <mouse-client-x:18b> <mouse-client-y:18b>
 *                           <sign-of-dx:1b> <abs-dx:11b>
 *                           <sign-of-dy:1b> <abs-dy:11b>
 *
 * // sum: 30b
 * <mouse-button-down> ::= 0b0010 <time-difference:20b>
 *                         <button-definition:6b>
 *   <mouse-button-up> ::= 0b0011 <time-difference:20b>
 *                         <button-definition:6b>
 *
 * // sum: 30b
 * <scroll-change-short> ::= 0b0100 <time-difference:10b>
 *                           <sign-of-dx:1b> <abs-dx:7b>
 *                           <sign-of-dy:1b> <abs-dy:7b>
 *
 * // sum: 48b
 * <scroll-change-long> ::= 0b0101 <time-difference:20b>
 *                          <sign-of-dx:1b> <abs-dx:11b>
 *                          <sign-of-dy:1b> <abs-dy:11b>
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
 *                          <window-size-x:15b> <window-size-y:15b>
 *
 * // sum: variable
 * <marker> ::= 0b1110 <time-difference:20b>
 *              <size:12b> <url-encoded-string:<size>B>
 *
 * // sum: 4+20+42+(8*18) = 210b
 * <debug-state> ::= 0b1111 <time-difference:20b>
 *                   <current-time-stamp:42b>
 *                   <current-mouse-screen-x:18b> <current-mouse-screen-y:18b>
 *                   <current-mouse-page-x:18b> <current-mouse-page-y:18b>
 *                   <current-scroll-top:18b> <current-scroll-left:18b>
 *                   <current-window-width:18b> <current-window-height:18b>
 *
 * JsDoc keyword:
 * https://code.google.com/p/jsdoc-toolkit/wiki/TagReference
 *
 * @link ClassName#algernonTrap
 */

(function(global){function moduleDefinition(/*wheelShim*/) { // dependency1, dependency2...
"use strict";
// ---------------------------------------------------------------------------

/**
 * @constructor algernonTrap
 * @param {String} element Html element which will be watched
 * @return {Function} Return algernonTrap, it will be the module
 */
function AlgernonTrap(element, idleTimeout) {

  // Set up defaults.
  if (element === undefined) {
    element = window.document;
  }

  var

    // self
    algernonTrap = this,

    // master loop
    running = false,

    // Buffer + transport
    Transport = require("./transport.js"),
    transport = new Transport(window),

    // State
    State = require("./state.js"),
    state = new State(window, transport, idleTimeout),

    // Handlers
    handlers = new Array(state),

    DebugStateHandler = require("./debugStateHandler.js"),

    MarkerHandler = require("./markerHandler.js"),
    MouseMoveHandler = require("./mouseMoveHandler.js"),
    MouseButtonHandler = require("./mouseButtonHandler.js"),
    PageScrollHandler = require("./pageScrollHandler.js");
    //MouseWheelHandler = require("./mouseWheelHandler.js");

  handlers.push(new DebugStateHandler(window, element, state, transport));

  handlers.push(new MarkerHandler(window, element, state, transport));

  handlers.push(new MouseMoveHandler(element, state, transport));

  handlers.push(new MouseButtonHandler(element, state, transport));

  // IE 6, 7, 8 does not support scroll event on document
  // http://www.quirksmode.org/dom/events/scroll.html
  handlers.push(new PageScrollHandler(element === window.document ? window : element, state, transport));

  // handlers.push(new MouseWheelHandler(element, state, transport));

  if (element === window || element === window.document) {
    var WindowSizeHandler = require("./windowSizeHandler.js");
    handlers.push(new WindowSizeHandler(window, state, transport));
  }

  /*
   * Public methods
   */
  return {

    /**
     *  Starts event processing.
     */
    start: function() {
      if (running) {
        return;
      }
      var length = handlers.length, i = 0;
      for (;i < length; i++) {
        if((handlers[i] !== undefined) && (typeof handlers[i].start === "function")) {
          handlers[i].start();
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
        if((handlers[i] !== undefined) && (typeof handlers[i].stop === "function")) {
          handlers[i].stop();
        }
      }
      running = false;
    },

    buffer: function() {
      return transport.buffer;
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
      var markEvent = new window.Event("at:mark");
      markEvent.text = text || "mark";
      element.dispatchEvent(markEvent);
    }

  };
}

/**
 * Expose AlgernonTrap
 */

return AlgernonTrap;

// ---------------------------------------------------------------------------
}

module.exports = moduleDefinition(/*require("../vendor/mdn-wheel.js")*/);

}(this));
