/* global module */

var VisibilityChangeHandler = function (window, state, buffer) {
  'use strict'
// ---------------------------------------------------------------------------

  var stateKey
  var eventKey

  var keys = {
    hidden: 'visibilitychange',
    webkitHidden: 'webkitvisibilitychange',
    mozHidden: 'mozvisibilitychange',
    msHidden: 'msvisibilitychange'
  }

  for (stateKey in keys) {
    if (stateKey in window.document) {
      eventKey = keys[stateKey]
      break
    }
  }

  var handler = function (event) {
    var dT = state.getDT(event, 20)

    if (window.document[stateKey]) { // idle/hidden, 0b1011
      buffer.push([11, dT],
                  [ 4, 20])
    } else { // focused/visible, 0b1010
      buffer.push([10, dT],
                  [ 4, 20])
    }
  }

  this.start = function () {
    window.addEventListener(eventKey, handler, false)
  }

  this.stop = function () {
    window.removeEventListener(eventKey, handler, false)
  }

// ---------------------------------------------------------------------------
}

module.exports = VisibilityChangeHandler
