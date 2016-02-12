/* global module */

var WindowUnloadHandler = function (window, state, buffer) {
  'use strict'
// ---------------------------------------------------------------------------

  var eventName = 'beforeunload'
  var handler = function (event) {
    var dT = state.getDT(event, 20)

    // 0b1001
    buffer.push([12, dT],
                [ 4, 20])
  }

  this.start = function () {
    window.addEventListener(eventName, handler, false)
  }

  this.stop = function () {
    window.removeEventListener(eventName, handler, false)
  }

// ---------------------------------------------------------------------------
}

module.exports = WindowUnloadHandler
