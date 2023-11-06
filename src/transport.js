//------------------------------------------------------------------------------
// Copyright (C) 2022- Cursor Insight Ltd.
//
// All rights reserved.
//------------------------------------------------------------------------------
// Transport base class for Cursor Insight's ligthweight mouse tracker.
//------------------------------------------------------------------------------

import simpleAutoBind from './simpleAutoBind';

import {
  DEFAULT_METADATA_SUBMISSION_INTERVAL,
  DEFAULT_TRAP_ENABLE_COMPRESSION,
  DEFAULT_TRAP_SERVER_URL,
  HEADER_MESSAGE_TYPE,
  METADATA_MESSAGE_TYPE,
  SCHEMA,
} from './constants';

class Transport {
  constructor(metadata, buffer) {
    simpleAutoBind(this);

    // Metadata reference
    this._metadata = metadata;

    // Buffer reference
    this._buffer = buffer;

    // Current sequence number that is sent over the wire
    this._sequenceNumber = 0;

    // Enable compressed, base64 encoded JSON data submission.  When `false`
    // only `JSON.stringify` is applied.
    this._enableCompression = DEFAULT_TRAP_ENABLE_COMPRESSION;

    // Set default URL
    this.url = DEFAULT_TRAP_SERVER_URL;

    // Save last submission's timestamp
    this._lastSubmissionTs = this._buffer.currentTs();

    // Last metadata submission's timestamp
    this._lastMetadataTs = 0;
  }

  createUrl(url) {
    const result = new URL(url, window.location);
    result.pathname = result.pathname
      .replace('$%7BsessionId%7D', this._metadata.sessionId)
      .replace('$%7BstreamId%7D', this._metadata.streamId);
    return result;
  }

  addHeaderToBuffer(buffer) {
    // eslint-disable-next-line no-plusplus
    const sequenceNumber = this._sequenceNumber++;

    buffer.unshift(
      // TODO refactor
      this.serializeHeader(
        this._lastSubmissionTs,
        this._metadata.sessionId,
        this._metadata.streamId,
        sequenceNumber,
        SCHEMA,
      ),
    );
  }

  // eslint-disable-next-line class-methods-use-this
  serializeHeader(ts, sessionId, streamId, sequenceNumber, schema) {
    return [
      HEADER_MESSAGE_TYPE,
      // TODO: merge this with buffer's currentTs
      ts,
      sessionId,
      streamId,
      sequenceNumber,
      schema,
    ];
  }

  maybeAddMetadataToBuffer(buffer, currentTs) {
    // Send metadata every minutes only once -- right before the data
    if (this._lastMetadataTs + DEFAULT_METADATA_SUBMISSION_INTERVAL
        < currentTs) {
      buffer.unshift(
        // TODO refactor: move this to the buffer -- and include these data
        // there
        this.serializeMetadata(
          this._lastSubmissionTs,
          this._metadata.platform,
          this._metadata.location,
          this._metadata.custom,
          this._metadata.screen,
          this._metadata.document,
        ),
      );
      this._lastMetadataTs = currentTs;
    }
  }

  // eslint-disable-next-line class-methods-use-this
  serializeMetadata(ts, platform, location, custom, screen, document) {
    return [
      METADATA_MESSAGE_TYPE,
      // TODO: merge this with buffer's currentTs
      ts,
      {
        platform,
        location,
        custom,
        screen,
        document,
      },
    ];
  }

  // Reset `_lastMetadataTs` to resend metadata message
  reset() {
    this._lastMetadataTs = 0;
  }
}

export default Transport;
