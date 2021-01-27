//------------------------------------------------------------------------------
// Copyright (C) 2023- Cursor Insight Ltd.
//
// All rights reserved.
//------------------------------------------------------------------------------
// Buffer to manage events before sending them to a Trap Server.
//
// It also manages the enabled/disabled state.
//------------------------------------------------------------------------------

import simpleAutoBind from './simpleAutoBind';

import {
  PERFORMANCE_TIMEORIGIN_ENABLED,
  DEFAULT_TRAP_BUFFER_SIZE_LIMIT,
  DEFAULT_TRAP_IDLE_TIMEOUT,
} from './constants';

class Buffer {
  constructor(trap) {
    simpleAutoBind(this);

    // Trap object reference -- to reach current transport module
    this._trap = trap;

    // Enable/disable Trap collection
    this._enabled = true;

    // Timestamp basis; milliseconds since the Unix epoch (1970-01-01)
    this._epoch = PERFORMANCE_TIMEORIGIN_ENABLED
      ? performance.timeOrigin
      : (() => {
        const hrSyncPoint = performance.now();
        const unixSyncPoint = new Date().getTime();
        return unixSyncPoint - hrSyncPoint; // timeOrigin
      })();

    // Event buffer to store messages
    this._buffer = [];

    // Maximum allowed buffer size -- it automatically sends the contents when
    // this limit is reached.
    this._bufferSizeLimit = DEFAULT_TRAP_BUFFER_SIZE_LIMIT;

    // Idle timeout (2 seconds)
    this._idleTimeout = DEFAULT_TRAP_IDLE_TIMEOUT;

    // Idle timer, tracking idle state
    this._idleTimer = undefined;
  }

  // Set buffer size limit
  set bufferSizeLimit(bufferSizeLimit) {
    this._bufferSizeLimit = bufferSizeLimit;
  }

  // Set idleTimeout
  set idleTimeout(idleTimeout) {
    this._idleTimeout = idleTimeout;
    this.setIdleTimer();
  }

  // Clear idle timer
  //
  // `clearIdleTimer` tries to be as thread safe as possible, since it
  // decouples nullifying the state variable and clearing the timer.
  clearIdleTimer() {
    if (this._idleTimer) {
      window.clearTimeout(this._idleTimer);
      this._idleTimer = null;
    }
  }

  // Set idle timer to its default
  setIdleTimer() {
    if (typeof this._idleTimeout === 'number') {
      this._idleTimer = window.setTimeout(
        this.handleTimeout, // TODO: emit event instead
        this._idleTimeout,
      );
    }
  }

  // Handle internal `idle` timeout
  handleTimeout() {
    this.submit();
  }

  // Register a new event to be sent
  push(type, originalEvent, ...props) {
    // Skip event if collection is not enabled
    if (!this._enabled) { return; }

    const event = [type, this.currentTs(originalEvent), ...props];

    this.clearIdleTimer();
    this._buffer.push(event);
    this.setIdleTimer();

    // Automatically send data when the buffer gets filled
    //
    // TODO: emit event
    if (this._buffer.length >= this._bufferSizeLimit) {
      this.submit();
    }
  }

  // Return buffer contents and clear it afterwards.
  flush() {
    const sendBuffer = Array.from(this._buffer); // clone buffer
    this._buffer.length = 0; // clear buffer
    return sendBuffer;
  }

  // Return whether the buffer is empty or not
  isEmpty() {
    return this._buffer.length === 0;
  }

  // Submit data over the wire
  submit() {
    this.clearIdleTimer(); // TODO: merge this with push's setIdleTimer call

    // Return an empty, immediately resolveable function
    if (this.isEmpty()) {
      return new Promise(() => { });
    }
    return this._trap.transport.submit(this.flush());
  }

  // Enable collection
  enable() {
    this._enabled = true;
    this.setIdleTimer();
  }

  // Disable data collection
  //
  // Mounted handlers work as before but events are not put into the buffer.
  disable() {
    this.clearIdleTimer();
    this.submit();
    this._enabled = false;
  }

  // Get current timestamp
  currentTs(event) {
    if (typeof event === 'undefined') {
      return (PERFORMANCE_TIMEORIGIN_ENABLED
        ? performance.now() + this._epoch
        : Date.now());
    }

    if (event.timeStamp < 1000000000000) {
      return event.timeStamp + this._epoch;
    }

    return event.timeStamp;
  }
}

export default Buffer;
