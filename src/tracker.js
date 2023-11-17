//------------------------------------------------------------------------------
// Copyright (C) 2021- Cursor Insight Ltd.
//
// All rights reserved.
//------------------------------------------------------------------------------
// Tracker is a full featured Trap application that can be used on a 3rd party
// website by adding a few lines of Javascript code in a `<script>` tag.
//
// Tracker's primary concern is to set up Trap's defaults and to start motion
// data collection.
//------------------------------------------------------------------------------

import {
  TRAP_SERVER_URL,
  TRAP_IDLE_TIMEOUT,
  TRAP_BUFFER_SIZE_LIMIT,
  TRAP_API_KEY_NAME,
  TRAP_API_KEY_VALUE,
  TRAP_ENABLE_COMPRESSION,
  TRACKER_OBJECT_NAME,
  TRAP_USE_WS_TRANSPORT,
} from './tracker-config';
import { Trap } from './trap';

class Tracker {
  constructor() {
    // Bind apply
    this.apply = this.apply.bind(this);

    // Initialize `ci-trap`
    const trap = new Trap();
    Object.freeze(trap);

    // Mount `document` and set up defaults
    trap.mount(document);

    // Save for further calls
    this.trap = trap;
  }

  // Apply an arbitrary function call to `this`
  apply(callParams) {
    const call = callParams[0];
    const params = Array.prototype.slice.call(callParams, 1);
    return this.trap[call](...params);
  }

  // Apply pre-recorded function calls and then replace pre-recording mechanism
  // with actual call behaviour.
  applyConfigurations(functionName) {
    if (typeof window[functionName] === 'function'
      && typeof window[functionName].q === 'object') {
      window[functionName].q.forEach(this.apply);
      window[functionName] = (...args) => this.apply(args);
    }
  }
}

// Make it a singleton instance
const tracker = new Tracker();
Object.freeze(tracker);

// Apply Trap configurations
tracker.trap.setUseWsTransport(TRAP_USE_WS_TRANSPORT);
tracker.trap.url(TRAP_SERVER_URL);
tracker.trap.idleTimeout(TRAP_IDLE_TIMEOUT);
tracker.trap.bufferSizeLimit(TRAP_BUFFER_SIZE_LIMIT);
tracker.trap.apiKeyName(TRAP_API_KEY_NAME);
tracker.trap.apiKeyValue(TRAP_API_KEY_VALUE);
tracker.trap.enableCompression(TRAP_ENABLE_COMPRESSION);

// Apply configurations that were set beforehand
tracker.applyConfigurations(TRACKER_OBJECT_NAME);

tracker.trap.start();

// Export the singleton instance as `default`
export default tracker;
