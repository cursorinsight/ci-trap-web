/* global module */

var WindowSizeHandler = function (window, state, buffer) {
  'use strict'
// ---------------------------------------------------------------------------

  var delay = 1000 / 15 // 15fps
  var timeout

  var handler = function (event) {
    var w  = window.innerWidth
    var h  = window.innerHeight
    var dT = state.getDT(event, 20)

    // type = 0b1000
    buffer.push([8, dT,  w,  h],
                [4, 20, 15, 15])
  }

  var throttler = function (event) {
    if (timeout) {
      window.clearTimeout(timeout)
    }

    timeout = window.setTimeout(function () {
      timeout = null
      handler(event)
    }, delay)
  }

  this.start = function () {
    state.wW = window.innerWidth
    state.wH = window.innerHeight
    window.addEventListener('resize', throttler, false)
  }

  this.stop = function () {
    window.removeEventListener('resize', throttler, false)
  }

// ---------------------------------------------------------------------------
}

module.exports = WindowSizeHandler
