/* global module */

var State = function (window, transport, idleTimeout) {
  'use strict'
// ---------------------------------------------------------------------------

  var idleHandler
  var idleTimer

  var epochTs
  var lastTs

  if (typeof idleTimeout === 'number') {
    idleHandler = function () {
      transport.send()
      idleTimer = null
    }
  }

  /*
   * Returns a stable time difference (between events, even if event does not
   * support event.timeStamp).
   *
   * Examples:
   *                  0 -- firefox window resize / scroll
   *          161262400 -- firefox mouse move
   *         1409096136 -- timestamp sec
   *         2000000000 -- timestamp sec boundary
   *      1409095770713 -- chrome all
   *      1409096838717 -- firefox (new Date()).getTime()
   *   1000000000000000 -- timestamp micro boundary
   *   1409096424364149 -- firefox custom event
   */
  this.getDT = function (event, bits) {

    var round = Math.round
    var currentTs = event && typeof event.timeStamp === 'number' && event.timeStamp || (new Date()).getTime()
    var dT

    if (idleTimer) {
      window.clearTimeout(idleTimer)
      idleTimer = null
    }

    if (currentTs > 1000000000000000) { // (microseconds) in Firefox, special events
      currentTs = round(currentTs / 1000)
    }

    if (currentTs < 2000000000) { // (milliseconds) it's Firefox take care
      if (!epochTs) {
        epochTs = (new Date()).getTime() - currentTs 
      }
      if (lastTs) {
        dT = (currentTs + epochTs) - lastTs
      }
      lastTs = (currentTs + epochTs)
    } else {                      // (milliseconds) everything else
      if (lastTs) {
        dT = currentTs - lastTs
      }
      lastTs = currentTs
    }

    // var dT1 = dT

    if (dT === undefined) {
      return 0
    }

    if (typeof idleTimeout === 'number') {
      idleTimer = window.setTimeout(idleHandler, idleTimeout)
    }

    if (bits) {
      var max = (1 << bits) - 1
      dT = dT > max ? max : dT
    }

    // TODO we should correct sync (when dT < 0)
    // if (dT < 0) { // we can correct sync
    //   epochTs = epochTs + dT
    //   lastTs  = lastTs + dT
    //   dT = 0
    // }
    // console.log(dT1, dT, dT1 !== dT && '-----------------------------------------')

    return dT
  }

  this.lastTs = function () {
    return lastTs
  }

  this.start = function () {
    // noop
  }

  this.stop = function () {
    lastTs = null
  }

// ---------------------------------------------------------------------------
}

module.exports = State
