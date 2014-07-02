/*! algernon-trap v0.1.0 - MIT license */

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
 *
 * TODO:
 * - fix function and other head-comments to be compatible with a/some doc gen.
 * - autostart
 * - periodically emit a bufferChanged event
 * - add captureStart / captureEnd events -- or similar
 */

;(function (global) { function moduleDefinition(/*dependency*/) {

// ---------------------------------------------------------------------------

'use strict';

// -- CONSTANTS -------------------------------------
var _map  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
var _head = 'BA'; // v1

// -- FNS / HELPERS ---------------------------------
var abs = Math.abs;

/**
 * @param {}
 * @return {}
 * @api public
 */
function algernonTrap(element) {

  // Is this OK?
  if (element === undefined) { element = document; }

  var
    algernonTrap = function() { return algernonTrap; },

    // -- DATA ------------------------------------------
    buffer  = _head,
    running = false,
    state   = { t: 0, x: 0, y: 0 },

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
    push = function(values, sizes) {
      // DEBUG-ONLY
      rawBuffer.push([values]);

      var idx, len=values.length, bc=0, av=0, as=0, size; // bc==bit counter, av=actual value
      for (idx=0; idx<len; idx++) {
        size = sizes[idx];
        if (av>0) { av = av << size; }
        av |= values[idx] & ((1<<size)-1);
        bc += size;
        while (bc>6) {
          bc -= 6;
          buffer += _map[av >>> bc];
          av &= (1<<bc)-1;
        }
      }
      buffer += _map[av << (6-bc)];
      return(buffer);
    },

    /**
     * Pushes button down/up event to buffer.
     */
    mouseButtonHandler = function(event) {
      var result = true, t, dt;
      if (!event) var event = window.event;

      // We prepare this for other event types (eg. touch, swipe, ...).
      switch(event.type) {
        case "mousedown":
          t = 2; // down
          break;
        case "mouseup":
          t = 3; // up
          break;
      }

      dt = event.timeStamp - state.t;
      state.t = event.timeStamp;

      push([t, dt>0xffff?0xffff:dt], [2, 16]);

      return(result);
    },

    /**
     * Pushes move event into buffer.
     */
    mouseMoveHandler = function(event) {
      var result = true, dx, absx, dy, absy, dt;
      if (!event) var event = window.event;

      dx      = event.screenX - state.x,
      absx    = abs(dx),
      dy      = event.screenY - state.y,
      absy    = abs(dy),
      dt      = event.timeStamp - state.t;

      state.x = event.screenX;
      state.y = event.screenY;
      state.t = event.timeStamp;

      // Small movements are stored in less space.
      if ((dt<1024)&&(absx<32)&&(absy<32)) {
        push([0, dt, dx<0?1:0, absx, dy<0?1:0, absy], [2, 10, 1, 5, 1, 5]);
      } else {
        push([1, dt>0xffff?0xffff:dt, dx<0?1:0, absx>0x7ff?0x7ff:absx, dy<0?1:0, absy>0x7ff?0x7ff:absy ],
             [2, 16,                  1,        11,                    1,        11                    ]);
      }

      return(result);
    },

    /**
     *  Start event processing.
     */
    start = function() {
      // Using addEventListener is the way forward.  For backward compatibility, use shims.
      if (running) { return; }
      element.addEventListener('mousemove', mouseMoveHandler);
      element.addEventListener('mousedown', mouseButtonHandler);
      element.addEventListener('mouseup',   mouseButtonHandler);
      running = true;
    },

    /**
     *  Stop event processing.
     */
    stop = function() {
      if (!running) { return; }
      element.removeEventListener('mousemove', mouseMoveHandler);
      element.removeEventListener('mousedown', mouseButtonHandler);
      element.removeEventListener('mouseup',   mouseButtonHandler);
      running = false;
    };

  algernonTrap.start  = start;
  algernonTrap.stop   = stop;
  algernonTrap.buffer = function() { return buffer; }

  // DEBUG-ONLY
  algernonTrap.rawBuffer = function() { return rawBuffer; }

  // TODO autostart

  return algernonTrap;
}

/**
 * Expose algernonTrap
 */

return algernonTrap;

// ---------------------------------------------------------------------------

} if (typeof exports === 'object') {
  // node export
  module.exports = moduleDefinition(/*require('dependency')*/);
} else if (typeof define === 'function' && define.amd) {
  // amd anonymous module registration
  define([/*'dependency'*/], moduleDefinition);
} else {
  // browser global
  global.algernonTrap = moduleDefinition(/*global.dependency*/);
}}(this));
