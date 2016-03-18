/* global module */

var IframeEventHandler = function (element, buffer, marker) {
  'use strict'
// ---------------------------------------------------------------------------

  var eventName = 'message'

  var handler = function (event) {
    var msg = event.data

    if (msg.target === 'push') {
      buffer.pushFromIframe(msg.sessionID, msg.values, msg.sizes)
    } else if (msg.target === 'pushRawBytes') {
      buffer.pushRawBytesFromIframe(msg.sessionID, msg.bytes)
    }
  }

  this.start = function () {
    element.addEventListener(eventName, handler)
  }

  this.stop = function () {
    element.removeEventListener(eventName, handler)
  }

// ---------------------------------------------------------------------------
}

module.exports = IframeEventHandler
