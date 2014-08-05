/*! algernon-trap v0.1.0 - MIT license */
/* global module require window */

/*
 * Motion event (mouse movement) catcher for browsers emitting data compatible
 * with Algernon's motion analyzer engine. (touch, gyro, etc. is WIP)
 *
 * Copyright (c) 2012--2014, GOLDA Bence <gbence@algernon.hu>
 *
 * Data format:
 * - head + (short-motion | long-motion | button)
 * - head:
 *   . constant: 'B' (1 byte)
 *   . version number: 1 -> 'A', 2 -> 'B', ... (1 byte)
 * - short-motion: (mousemove) && |dt| < 1024 && |dx| < 32 && |dy| < 32
 *   . event-type, constant: 0 (2 bits)
 *   . time-difference, integer in milliseconds: 0..1023 (10 bits)
 *   . sign of X-difference: 1->negative, 0->positive (1 bit)
 *   . absolute of X-difference: 0..31 (5 bits)
 *   . sign of Y-difference: 1->negative, 0->positive (1 bit)
 *   . absolute of Y-difference: 0..31 (5 bits)
 * - long-motion: (mousemove) && (otherwise)
 *   . event-type, constant: 1 (2 bits)
 *   . time-difference, integer in milliseconds: 0..65535 (16 bits)
 *   . sign of X-difference: 1->negative, 0->positive (1 bit)
 *   . absolute of X-difference: 0..2047 (11 bits)
 *   . sign of Y-difference: 1->negative, 0->positive (1 bit)
 *   . absolute of Y-difference: 0..2047 (11 bits)
 * - button: (onclick)
 *   . event-type, constant: 2->mouse down, 3->mouse up (2 bits)
 *
 * TODO:
 * - fix function and other head-comments to be compatible with a/some doc gen.
 * - autostart
 * - periodically emit a bufferChanged event
 * - add captureStart / captureEnd events -- or similar
 *
 * JsDoc keyword:
 * https://code.google.com/p/jsdoc-toolkit/wiki/TagReference
 *
 * @link ClassName#algernonTrap
 */

(function(global) {function moduleDefinition() { // dependency1, dependency2...
"use strict";
// ---------------------------------------------------------------------------

/**
 * @constructor algernonTrap
 * @param {String} element Html element which will be watched
 * @return {Function} Return algernonTrap, it will be the module
 */
function algernonTrap(element) {

  // Set up defaults.
  if (element === undefined) {
    element = window.document;
  }

  var

    /**
     * @memberOf algernonTrap
     * @constructor algernonTrapInstance
     * @return {function}
     */
    algernonTrapInstance = function() {
      return algernonTrapInstance;
    },

    // State
    running = false,
    state = { t: 0 },

    // Buffer
    Buffer = require("./buffer.js"),
    buffer = new Buffer(),

    // Handlers
    MouseMoveHandler = require("./mouseMoveHandler.js"),
    mouseMoveHandler = new MouseMoveHandler(element, state, buffer),

    MouseButtonHandler = require("./mouseButtonHandler.js"),
    mouseButtonHandler = new MouseButtonHandler(element, state, buffer),

    PageScrollHandler = require("./pageScrollHandler.js"),
    pageScrollHandler = new PageScrollHandler(element, state, buffer),

    handlers = [mouseMoveHandler, mouseButtonHandler, pageScrollHandler],

    // Transport
    Transport = require("./transport.js"),
    transport = new Transport(window, "/s", buffer),

    /**
     *  Starts event processing.
     */
    start = function() {
      // Using addEventListener is the way forward.  For backward compatibility, use shims.
      if (running) {
        return;
      }
      for (var i in handlers) {
        handlers[i].start();
      }
      running = true;
    },

    /**
     *  Stops event processing.
     */
    stop = function() {
      if (!running) {
        return;
      }
      for (var i in handlers) {
        handlers[i].stop();
      }
      running = false;
    };

  algernonTrapInstance.start  = start;
  algernonTrapInstance.stop   = stop;
  algernonTrapInstance.buffer = function() { return buffer.buffer; };
  algernonTrapInstance.send   = function() { return transport.send.apply(this, arguments); };

  // DEBUG-ONLY
  algernonTrapInstance.rawBuffer = function() { return buffer.rawBuffer; };

  // TODO autostart

  return algernonTrapInstance;
}

/**
 * Expose algernonTrap
 */

return algernonTrap;

// ---------------------------------------------------------------------------
}

module.exports = moduleDefinition(/*require('dependency')*/);

}(this));
