//------------------------------------------------------------------------------
// Copyright (C) 2023- Cursor Insight Ltd.
//
// All rights reserved.
//------------------------------------------------------------------------------
// TimeStamp conversion helper class
//------------------------------------------------------------------------------

import simpleAutoBind from './simpleAutoBind';

class TimeUtils {
  constructor() {
    simpleAutoBind(this);

    // Timestamp basis; milliseconds since the Unix epoch (1970-01-01)
    this.actualizeEpoch();
  }

  // Get current timestamp
  currentTs() {
    return performance.now() + this._epoch;
  }

  convertEventTimeToTs(timeStamp) {
    if (timeStamp < 1000000000000) {
      return timeStamp + this._epoch;
    }

    return timeStamp;
  }

  actualizeEpoch() {
    const hrSyncPoint = performance.now();
    const unixSyncPoint = new Date().getTime();
    this._epoch = unixSyncPoint - hrSyncPoint; // timeOrigin
  }
}

const instance = new TimeUtils();
export default instance;
