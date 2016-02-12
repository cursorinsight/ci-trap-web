/* global module */

// TODO: http://www.jacklmoore.com/notes/mouse-position/

var MouseMoveHandler = function (element, state, buffer) {
  'use strict'
// ---------------------------------------------------------------------------

  var eventName = 'mousemove'
  var handler = function (event) {
    var dT = state.getDT(event, 20)
    var sX = event.screenX
    var sY = event.screenY

    // Saving for next check
    state.mouseScreenX = sX
    state.mouseScreenY = sY

    buffer.push([0, dT, sX, sY],
                [4, 20, 18, 18])

    // Saving for markers -- temporarily disabled
    // state.cX = event.clientX
    // state.cY = event.clientY
    // buffer.push([0, dT, sX, sY, event.clientX, event.clientY],
    //             [4, 20, 18, 18,            18,            18])

    return true
  }

  this.start = function () {

    // TODO: Something more accurate is needed.
    state.mouseScreenX = state.mouseScreenX || 0
    state.mouseScreenY = state.mouseScreenY || 0

    element.addEventListener(eventName, handler)
  }

  this.stop = function () {
    element.removeEventListener(eventName, handler)
  }

// ---------------------------------------------------------------------------
}

module.exports = MouseMoveHandler
