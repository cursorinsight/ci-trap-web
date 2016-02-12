/* global module */

var WindowPositionHandler = function (window, state, buffer) {
  'use strict'
// ---------------------------------------------------------------------------

  var eventName = 'positionchanged'
  var longDelay = 1000 / 2 // 2fps
  var shortDelay = 1000 / 15 // 15fps
  var throttleBase = 15 // it's a 'constant'
  var throttleCount = throttleBase
  var timeout

  var windowPositionX = function () {
    return window.screenX || window.screenLeft || 0
  }

  var windowPositionY = function () {
    return window.screenY || window.screenTop || 0
  }

  var handler = function (event) {
    var dT = state.getDT(null, 20)

    state.windowPositionX = event.x
    state.windowPositionY = event.y

    // type = 0b1001
    buffer.push([9, dT, event.x, event.y],
               [4, 20,      15,      15])
  }

  var poller = function () {
    var x = windowPositionX()
    var y = windowPositionY()

    if (state.windowPositionX !== x || state.windowPositionY !== y) {
      var event = new window.Event(eventName)
      event.x = x
      event.y = y
      window.dispatchEvent(event)

      throttleCount = throttleBase
    }

    if (throttleCount > 0) {
      throttleCount--
      timeout = window.setTimeout(poller, shortDelay)
    } else {
      timeout = window.setTimeout(poller, longDelay)
    }
  }

  var startPoller = function () {
    window.setTimeout(poller, longDelay)
  }

  var stopPoller = function () {
    if (timeout) {
      window.clearTimeout(timeout)
    }
  }

  this.start = function () {
    state.windowPositionX = windowPositionX()
    state.windowPositionY = windowPositionY()
    window.addEventListener(eventName, handler, false)
    startPoller()
  }

  this.stop = function () {
    stopPoller()
    window.removeEventListener(eventName, handler, false)
  }

// ---------------------------------------------------------------------------
}

module.exports = WindowPositionHandler
