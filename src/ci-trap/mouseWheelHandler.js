/* global module */

var MouseWheelHandler = function (element, state, _buffer) {
  'use strict'
// ---------------------------------------------------------------------------

  var eventName = 'wheel'

  // TODO
  var handler = function (event) {
    var _dT = state.getDT(event, 20)

    // console.log('wheeling', event)
  }

  this.start = function () {
    element.addEventListener(eventName, handler)
  }

  this.stop = function () {
    element.removeEventListener(eventName, handler)
  }

// ---------------------------------------------------------------------------
}

module.exports = MouseWheelHandler
