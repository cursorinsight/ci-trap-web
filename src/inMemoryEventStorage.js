//------------------------------------------------------------------------------
// Copyright (C) 2024- Cursor Insight Ltd.
//
// All rights reserved.
//------------------------------------------------------------------------------
// In memory event storage for Cursor Insight's ligthweight mouse tracker.
//------------------------------------------------------------------------------
import clone from 'rfdc/default';

import simpleAutoBind from './simpleAutoBind';
import {
  DEFAULT_TRAP_IN_MEMORY_STORAGE_SIZE_LIMIT,
} from './constants';

class InMemoryEventStorage {
  constructor() {
    simpleAutoBind(this);

    // Initialize in-memory buffer
    this._inMemoryEventStorage = [];

    // Set initial size limit of the in memory buffer
    this._sizeLimit = DEFAULT_TRAP_IN_MEMORY_STORAGE_SIZE_LIMIT;
  }

  get sizeLimit() {
    return this._sizeLimit;
  }

  set sizeLimit(sizeLimit) {
    this._sizeLimit = sizeLimit;
  }

  get inMemoryEventStorage() {
    return this._inMemoryEventStorage;
  }

  set inMemoryEventStorage(inMemoryEventStorage) {
    this._inMemoryEventStorage = inMemoryEventStorage;
  }

  // Event handler for data submission
  onDataSubmitted(data) {
    this.inMemoryEventStorage.push(data);
    this.cleanUpInMemoryBufferIfNeeded();
  }

  // Returns the collected events and clears the buffer
  flushStorage() {
    const result = this.inMemoryEventStorage.flat();
    this.inMemoryEventStorage = [];
    return result;
  }

  // Ensure there are at most sizeLimit events
  cleanUpInMemoryBufferIfNeeded() {
    let eventCount = this.eventCount();

    while (eventCount > this.sizeLimit) {
      const item = this.inMemoryEventStorage.shift();
      eventCount -= item.length;
    }
  }

  // Return the number of events
  eventCount() {
    return this.inMemoryEventStorage.reduce(
      (acc, item) => acc + item.length,
      0,
    );
  }

  // Returns a deep copy of the collected events
  collectedEvents() {
    return clone(this.inMemoryEventStorage.flat());
  }
}

export default InMemoryEventStorage;
