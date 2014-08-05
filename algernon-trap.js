/*! algernon-trap v0.1.0 - MIT license */
/* global document window exports module define */

/*
 * Motion event (mouse movement) catcher for browsers emitting data compatible
 * with Algernon's motion analyzer engine. (touch, gyro, etc. is WIP)
 *
 * Copyright (c) 2012--2014, GOLDA Bence <gbence@algernon.hu>
 *
 * ----------------------------------------------
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

// ---------------------------------------------------------------------------

"use strict";


// @constant
var map  = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
  head = "BA"; // v1

// -- FNS / HELPERS ---------------------------------
var abs = Math.abs;

/**
 * @constructor algernonTrap
 * @param {String} element Html element which will be watched
 * @return {Function} Return algernonTrap, it will be the module
 */
function algernonTrap(element) {

  if(element === undefined) {
    element = document;
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

    // -- DATA ------------------------------------------
    buffer  = head,
    running = false,
    state   = {t: 0, x: 0, y: 0},

    // DEBUG-ONLY
    rawBuffer = [],

    // -- FUNCTIONS -------------------------------------

    /**
     * Encodes and pushes values sampled by its given size into buffer.
     *
     * * values: 
     * * sizes: pairwise bit sizes for values.
     *
     */
    send = function(parameters, callback) {
      var req,
        dataString = "",
        parametersLength = 0,
        key;
      for (key in parameters) {
        if (parameters.hasOwnProperty(key)) {
          parametersLength++;
        }
      }
      for (key in parameters) {
        if (parameters.hasOwnProperty(key)) {
          dataString += key + "=" + encodeURIComponent(parameters[key].toString());
          parametersLength--;
          if (parametersLength > 0) {
            dataString += "&";
          }
        }
      }

      if (window.XMLHttpRequest) { // code for IE7+, Firefox, Chrome, Opera, Safari
        req = new window.XMLHttpRequest();
      } else { // code for IE6, IE5
        req = new window.ActiveXObject("Microsoft.XMLHTTP");
      }
      req.onreadystatechange = function() {
        if (callback){
          if ((req.readyState === 4) && (req.status === 200)) {
            callback(req);
          }
        }
      };
      req.open("POST", "/", true);
      req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      req.send(dataString);
    },

    push = function(values, sizes) {
      // DEBUG-ONLY
      rawBuffer.push([values]);

      var idx,
        len = values.length,
        bc = 0,
        av = 0,
        size; // bc==bit counter, av=actual value
      for (idx = 0; idx < len; idx++) {
        size = sizes[idx];
        if (av > 0) {
          av = av << size;
        }
        av |= values[idx] & ((1 << size) - 1);
        bc += size;
        while (bc > 6) {
          bc -= 6;
          buffer += map[av >>> bc];
          av &= (1 << bc) - 1;
        }
      }
      buffer += map[av << (6 - bc)];
      return buffer;
    },

    /**
     * Pushes button down/up event to buffer.
     */
    mouseButtonHandler = function(event) {
      var result = true,
        t, dt,
        mouseEvent = event ? event : window.event;

      // We prepare this for other event types (eg. touch, swipe, ...).
      switch (mouseEvent.type) {
        case "mousedown":
          t = 2; // down
          break;

        case "mouseup":
          t = 3; // up
          break;
      }

      dt = mouseEvent.timeStamp - state.t;
      state.t = mouseEvent.timeStamp;

      push([t, dt > 0xffff ? 0xffff : dt], [2, 16]);

      return result;
    },

    /**
     * Pushes move event into buffer.
     */
    mouseMoveHandler = function(event) {
      var result = true,
        dx, absx,
        dy, absy,
        dt,
        mouseEvent = event ? event : window.event;

      dx      = mouseEvent.screenX - state.x;
      absx    = abs(dx);
      dy      = mouseEvent.screenY - state.y;
      absy    = abs(dy);
      dt      = mouseEvent.timeStamp - state.t;

      state.x = mouseEvent.screenX;
      state.y = mouseEvent.screenY;
      state.t = mouseEvent.timeStamp;

      // Small movements are stored in less space.
      if ((dt < 1024) && (absx < 32) && (absy < 32)) {
        push([0, dt, (dx < 0) ? 1 : 0, absx, (dy < 0) ? 1 : 0, absy],
             [2, 10, 1, 5, 1, 5]);
      } else {
        push([1, (dt > 0xffff) ? 0xffff : dt, (dx < 0) ? 1 : 0, (absx > 0x7ff) ? 0x7ff : absx, (dy < 0) ? 1 : 0, (absy > 0x7ff) ? 0x7ff : absy],
             [2, 16, 1, 11, 1, 11]);
      }

      return result;
    },

    /**
     *  Start event processing.
     */
    start = function() {
      // Using addEventListener is the way forward.  For backward compatibility, use shims.
      if (running) {
        return;
      }
      element.addEventListener("mousemove", mouseMoveHandler);
      element.addEventListener("mousedown", mouseButtonHandler);
      element.addEventListener("mouseup", mouseButtonHandler);
      running = true;
    },

    /**
     *  Stop event processing.
     */
    stop = function() {
      if (!running) {
        return;
      }
      element.removeEventListener("mousemove", mouseMoveHandler);
      element.removeEventListener("mousedown", mouseButtonHandler);
      element.removeEventListener("mouseup", mouseButtonHandler);
      running = false;
    };

  algernonTrapInstance.start  = start;
  algernonTrapInstance.stop   = stop;
  algernonTrapInstance.buffer = function() { return buffer; };
  algernonTrapInstance.send   = send;
  algernonTrapInstance.sendAndReset = function(buf, callback) {
    algernonTrapInstance.send(buf, callback);
    buffer = head;
  };

  // DEBUG-ONLY
  algernonTrapInstance.rawBuffer = function() { return rawBuffer; };

  // TODO autostart

  return algernonTrapInstance;
}

/**
 * Expose algernonTrap
 */

return algernonTrap;

// ---------------------------------------------------------------------------

} if (typeof exports === "object") {
  // node export
  module.exports = moduleDefinition(/*require('dependency')*/);
} else if ((typeof define === "function") && define.amd) {
  // amd anonymous module registration
  define([/*'dependency'*/], moduleDefinition);
} else {
  // browser global
  global.algernonTrap = moduleDefinition(/*global.dependency*/);
}}(this));
