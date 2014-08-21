/* global module */

var State = function() {
"use strict";
// ---------------------------------------------------------------------------

var
  startTs, startEts, lastEts;

/*
 * Returns a stable time difference (between events, even if event does not
 * support event.timeStamp).
 */
this.getDT = function(event, bits) {

  var dT;

  if (event && typeof event.timeStamp === "number" && event.timeStamp > 100) {

    // Initialization
    if (!lastEts) {
      startTs = (new Date()).getTime();
      lastEts = startEts = event.timeStamp;
    }

    dT = event.timeStamp - lastEts;
    lastEts = event.timeStamp;

  } else {

    // Can not do initialization if event.timeStamp is null || 0 ==> dT will
    // remain undefined (TODO)
    if (startEts && lastEts) {
      var nowEts = (new Date()).getTime() - startTs + startEts;
      dT = nowEts - lastEts;
      lastEts = nowEts;
    }

  }

  if (bits) {
    var max = (1 << bits) - 1;
    dT = dT > max ? max : dT;
  }

  return dT;
};

this.start = function() {
  // noop
};

this.stop = function() {
  startTs = startEts = lastEts = null;
};

// ---------------------------------------------------------------------------
};

module.exports = State;
