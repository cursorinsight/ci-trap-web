/* global module */

var State = function(window, transport, idleTimeout) {
"use strict";
// ---------------------------------------------------------------------------

var
  idleHandler, idleTimer,
  startTs, startEts, lastEts;

if (typeof idleTimeout === "number") {
  idleHandler = function() {
    transport.send();
    idleTimer = null;
  };
}

/*
 * Returns a stable time difference (between events, even if event does not
 * support event.timeStamp).
 *
 * `event` may contain 3 types of `timeStamps`:
 * 1. milliseconds from epoch (eg. uptime), --> Ets
 * 2. milliseconds from epoch (eg. 1970-01-01), --> Ts
 * 3. microseconds from epoch (eg. 1970-01-01), --> Ts
 * 4. null
 */
this.getDT = function(event, bits) {

  var
    currentTs = event && typeof event.timeStamp === "number" && event.timeStamp,
    dT;

  if (idleTimer) {
    window.clearTimeout(idleTimer);
    idleTimer = null;
  }

  if (currentTs < 2000000000) {

    // Initialization
    if (!lastEts) {
      startTs = (new Date()).getTime();
      lastEts = startEts = currentTs;
    }

    dT = currentTs - lastEts;
    lastEts = currentTs;

  } else {

    // Can not do initialization if event.timeStamp is null || 0 ==> dT will
    // remain undefined (TODO)
    if (startEts && lastEts) {
      var nowEts = (new Date()).getTime() - startTs + startEts;
      dT = nowEts - lastEts;
      lastEts = nowEts;
    }

  }

  if (typeof idleTimeout === "number") {
    idleTimer = window.setTimeout(idleHandler, idleTimeout);
  }

  if (dT === undefined) {
    return 0;
  }

  if (bits) {
    var max = (1 << bits) - 1;
    dT = dT > max ? max : dT;
  }

  if (dT < 0) { // we can correct sync
    startTs = startTs - dT;
    dT = 0;
  }

  return dT;
};

this.lastTs = function() {
  return lastEts - startEts + startTs;
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
