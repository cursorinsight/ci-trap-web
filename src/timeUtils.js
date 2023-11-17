//------------------------------------------------------------------------------
// Copyright (C) 2023- Cursor Insight Ltd.
//
// All rights reserved.
//------------------------------------------------------------------------------
// TimeStamp conversion helper class
//------------------------------------------------------------------------------

import simpleAutoBind from './simpleAutoBind';

import {
  PERFORMANCE_TIMEORIGIN_ENABLED,
} from './constants';

class TimeUtils {
  constructor() {
    simpleAutoBind(this);

    // Timestamp basis; milliseconds since the Unix epoch (1970-01-01)
    this._epoch = PERFORMANCE_TIMEORIGIN_ENABLED
      ? performance.timeOrigin
      : (() => {
        const hrSyncPoint = performance.now();
        const unixSyncPoint = new Date().getTime();
        return unixSyncPoint - hrSyncPoint; // timeOrigin
      })();
  }

  // Get current timestamp
  currentTs() {
    return (PERFORMANCE_TIMEORIGIN_ENABLED
      ? performance.now() + this._epoch
      : Date.now());
  }

  convertEventTimeToTs(timeStamp) {
    if (timeStamp < 1000000000000) {
      return timeStamp + this._epoch;
    }

    return timeStamp;
  }
}

const instance = new TimeUtils();
export default instance;
