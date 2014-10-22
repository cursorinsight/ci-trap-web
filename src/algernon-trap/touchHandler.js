/* global module */

// TODO: save touchScreenX/Y values into state
// TODO: simplify / group start/end/move handlers, they are nearly identical

var TouchHandler = function(element, state, buffer) {
"use strict";
// ---------------------------------------------------------------------------

var
  startEventName = "touchstart",
  endEventName = "touchend",
  moveEventName = "touchmove",

  touchIdToId = [],

  // finds an existing (or free) id for given touchId, starting from 0.
  resolveId = function(touchId) {
    var
      firstFree,
      length = touchIdToId.length,
      i = 0;
    for(; i < length; i++) {
      if (touchIdToId[i] === touchId) { return i; }
      if (touchIdToId[i] === undefined) { firstFree = firstFree || i; }
    }
    if (typeof firstFree === "number") {
      touchIdToId[firstFree] = touchId;
      return firstFree;
    } else {
      touchIdToId.push(touchId);
      return length;
    }
  },

  // removes touchId from list.
  removeId = function(touchId) {
    var length = touchIdToId.length, i = 0;
    for(; i < length; i++) {
      if (touchIdToId[i] === touchId) { touchIdToId[i] = undefined; }
    }
    i--;
    for(; i >= 0; i--) {
      if (touchIdToId[i] === undefined) {
        touchIdToId.pop();
      } else {
        break;
      }
    }
  },

  startHandler = function(event) {
    var
      dT = state.getDT(event, 20),
      changedTouches = event.changedTouches,
      length = changedTouches.length,
      i = 0;

    for(; i < length; i++) {
      var
        ev = changedTouches[i],
        id = resolveId(ev.identifier);
      buffer.push([3, dT, 1, id, ev.screenX, ev.screenY],
                  [4, 20, 1,  5,         18,         18]);
      dT = 0; // next
    }

    return true;
  },

  endHandler = function(event) {
    var
      dT = state.getDT(event, 20),
      changedTouches = event.changedTouches,
      length = changedTouches.length,
      i = 0;

    for(; i < length; i++) {
      var
        ev = changedTouches[i],
        id = resolveId(ev.identifier);
      buffer.push([3, dT, 0, id, ev.screenX, ev.screenY],
                  [4, 20, 1,  5,         18,         18]);

      removeId(ev.identifier);

      dT = 0; // next
    }

    return true;
  },

  moveHandler = function(event) {
    var
      dT = state.getDT(event, 20),
      changedTouches = event.changedTouches,
      length = changedTouches.length,
      i = 0;

    for(; i < length; i++) {
      var
        ev = changedTouches[i],
        id = resolveId(ev.identifier);
      buffer.push([1, dT, 0, id, ev.screenX, ev.screenY],
                  [4, 20, 1,  5,         18,         18]);
      dT = 0; // next
    }

    return true;
  };

this.start = function() {
  element.addEventListener(startEventName, startHandler);
  element.addEventListener(moveEventName, moveHandler);
  element.addEventListener(endEventName, endHandler);
};

this.stop = function() {
  element.removeEventListener(startEventName, startHandler);
  element.removeEventListener(moveEventName, moveHandler);
  element.removeEventListener(endEventName, endHandler);
};

// ---------------------------------------------------------------------------
};

module.exports = TouchHandler;
