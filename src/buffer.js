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
import eventEmitterMixin from './eventEmitterMixin';

import {
  DEFAULT_TRAP_BUFFER_SIZE_LIMIT,
  DEFAULT_TRAP_IDLE_TIMEOUT,
} from './constants';

class Buffer {
  constructor() {
    simpleAutoBind(this);

    // Enable/disable Trap collection
    this._enabled = true;

    // Event buffer to store messages
    this._buffer = [];

    // Fix items at the beginning of the stream
    this._headerItems = [];

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
        this.requestSubmission,
        this._idleTimeout,
      );
    }
  }

  // Register a new event to be sent
  push(type, timestamp, ...props) {
    // Skip event if collection is not enabled
    if (!this._enabled) { return; }

    const event = [type, timestamp, ...props];

    this.clearIdleTimer();
    this._buffer.push(event);
    this.setIdleTimer();

    // Automatically send data when the buffer gets filled
    if (this._buffer.length >= this._bufferSizeLimit) {
      this.requestSubmission();
    }
  }

  // Add header item
  addHeaderItem(...props) {
    this._headerItems.push([...props]);
  }

  // Return buffer contents and clear it afterwards.
  flush() {
    this.clearIdleTimer(); // TODO: merge this with push's setIdleTimer call

    // create merged buffer
    const sendBuffer = this._headerItems.concat(this._buffer);
    this._buffer.length = 0; // clear buffer
    this._headerItems.length = 0;
    return sendBuffer;
  }

  // Return whether the buffer is empty or not
  isEmpty() {
    return this._buffer.length === 0;
  }

  // Submit data over the wire
  requestSubmission(final) {
    return this.emit('requestSubmission', final);
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
    this.requestSubmission(true);
    this._enabled = false;
    this._headerItems.length = 0;
  }
}

// Append mixins
Object.assign(Buffer.prototype, eventEmitterMixin);

export default Buffer;
