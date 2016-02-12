/* global module */

// TODO: save touchScreenX/Y values into state
// TODO: simplify / group start/end/move handlers, they are nearly identical

var TouchHandler = function (element, state, buffer) {
  'use strict'
// ---------------------------------------------------------------------------

  var startEventName = 'touchstart'
  var endEventName = 'touchend'
  var moveEventName = 'touchmove'

  var touchIdToId = []

  // finds an existing (or free) id for given touchId, starting from 0.
  var resolveId = function (touchId) {
    var firstFree
    var length = touchIdToId.length
    var i = 0
    for (; i < length; i++) {
      if (touchIdToId[i] === touchId) { return i }
      if (touchIdToId[i] === undefined) { firstFree = firstFree || i }
    }
    if (typeof firstFree === 'number') {
      touchIdToId[firstFree] = touchId
      return firstFree
    } else {
      touchIdToId.push(touchId)
      return length
    }
  }

  // removes touchId from list.
  var removeId = function (touchId) {
    var length = touchIdToId.length
    var i = 0
    for (; i < length; i++) {
      if (touchIdToId[i] === touchId) { touchIdToId[i] = undefined }
    }
    i--
    for (; i >= 0; i--) {
      if (touchIdToId[i] === undefined) {
        touchIdToId.pop()
      } else {
        break
      }
    }
  }

  var startHandler = function (event) {
    var dT = state.getDT(event, 20)
    var changedTouches = event.changedTouches
    var length = changedTouches.length
    var i = 0

    for (; i < length; i++) {
      var ev = changedTouches[i]
      var id = resolveId(ev.identifier)
      buffer.push([3, dT, 1, id, ev.screenX, ev.screenY],
                  [4, 20, 1,  5,         18,         18])
      dT = 0 // next
    }

    return true
  }

  var endHandler = function (event) {
    var dT = state.getDT(event, 20)
    var changedTouches = event.changedTouches
    var length = changedTouches.length
    var i = 0

    for (; i < length; i++) {
      var ev = changedTouches[i]
      var id = resolveId(ev.identifier)
      buffer.push([3, dT, 0, id, ev.screenX, ev.screenY],
                  [4, 20, 1,  5,         18,         18])

      removeId(ev.identifier)

      dT = 0 // next
    }

    return true
  }

  var moveHandler = function (event) {
    var dT = state.getDT(event, 20)
    var changedTouches = event.changedTouches
    var length = changedTouches.length
    var i = 0

    for (; i < length; i++) {
      var ev = changedTouches[i]
      var id = resolveId(ev.identifier)
      buffer.push([1, dT, 0, id, ev.screenX, ev.screenY],
                  [4, 20, 1,  5,         18,         18])
      dT = 0 // next
    }

    return true
  }

  this.start = function () {
    element.addEventListener(startEventName, startHandler)
    element.addEventListener(moveEventName, moveHandler)
    element.addEventListener(endEventName, endHandler)
  }

  this.stop = function () {
    element.removeEventListener(startEventName, startHandler)
    element.removeEventListener(moveEventName, moveHandler)
    element.removeEventListener(endEventName, endHandler)
  }

// ---------------------------------------------------------------------------
}

module.exports = TouchHandler
