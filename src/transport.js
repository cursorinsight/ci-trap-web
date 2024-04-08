//------------------------------------------------------------------------------
// Copyright (C) 2022- Cursor Insight Ltd.
//
// All rights reserved.
//------------------------------------------------------------------------------
// Transport base class for Cursor Insight's ligthweight mouse tracker.
//------------------------------------------------------------------------------

import simpleAutoBind from './simpleAutoBind';

import {
  DEFAULT_TRAP_ENABLE_COMPRESSION,
  DEFAULT_TRAP_SERVER_URL,
} from './constants';

class Transport {
  constructor(metadata, buffer) {
    simpleAutoBind(this);

    // Metadata reference
    this._metadata = metadata;

    // Buffer reference
    this._buffer = buffer;

    // Enable compressed, base64 encoded JSON data submission.  When `false`
    // only `JSON.stringify` is applied.
    this._enableCompression = DEFAULT_TRAP_ENABLE_COMPRESSION;

    // Set default URL
    this._url = this.createUrl(DEFAULT_TRAP_SERVER_URL);
  }

  // `url` setter
  //
  // It replaces ${sessionId} and ${streamId} occurences with their values.
  set url(url) {
    this._url = this.createUrl(url);
  }

  createUrl(url) {
    const result = new URL(url, window.location);
    result.pathname = result.pathname
      .replace('$%7BsessionId%7D', this._metadata.sessionId)
      .replace('$%7BstreamId%7D', this._metadata.streamId);
    return result;
  }
}

export default Transport;
