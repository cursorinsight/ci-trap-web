//------------------------------------------------------------------------------
// Copyright (C) 2022- Cursor Insight Ltd.
//
// All rights reserved.
//------------------------------------------------------------------------------
// HTTP transport for Cursor Insight's ligthweight mouse tracker.
//------------------------------------------------------------------------------

import { strToU8, zlibSync } from 'fflate';
import simpleAutoBind from './simpleAutoBind';

import {
  DEFAULT_TRAP_ENABLE_COMPRESSION,
  DEFAULT_TRAP_SERVER_URL,
  DEFAULT_METADATA_SUBMISSION_INTERVAL,
  HEADER_EVENT_TYPE,
  METADATA_EVENT_TYPE,
  SCHEMA,
} from './constants';

class HTTP {
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

  // `enableCompression` setter
  set enableCompression(enableCompression) {
    this._enableCompression = !!enableCompression;
  }

  // `url` setter
  //
  // It replaces ${sessionId} and ${streamId} occurences with their values.
  set url(url) {
    this._url = new URL(url, window.location);
    this._url.pathname = this._url.pathname
      .replace('$%7BsessionId%7D', this._metadata.sessionId)
      .replace('$%7BstreamId%7D', this._metadata.streamId);
  }

  // Submit data to remote Trap server
  //
  // Since `Array.concat()` and `+` copies the entire array, `buffer` is
  // extended with a `header` and `metadata` using an unconventional
  // `unshift()` call.
  async submit(buffer) {
    // Set up monotonically incrementing sequence number
    //
    // eslint-disable-next-line no-plusplus
    const sequenceNumber = this._sequenceNumber++;

    // Current timestamp
    const currentTs = this._buffer.currentTs();

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

    // Put the header to the very first place
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

    // Save last submission's timestamp -- for the next run
    this._lastSubmissionTs = currentTs;

    // Compress data if `enableCompression` is set
    const final = this._enableCompression
      ? zlibSync(strToU8(JSON.stringify(buffer)), { level: 9, mem: 10 })
      : JSON.stringify(buffer);

    // Set up content-type and its optional arguments: API key and envelope
    // encoding
    let contentType = 'text/plain';
    if (typeof this._metadata.apiKeyName === 'string'
      && this._metadata.apiKeyName !== ''
      && typeof this._metadata.apiKeyValue === 'string'
      && this._metadata.apiKeyValue !== '') {
      contentType += '; '
        + `${this._metadata.apiKeyName}=`
        + `${this._metadata.apiKeyValue}`;
    }
    contentType += `; encoding=json${this._enableCompression
      ? '+zlib'
      : ''}`;

    // Send data to a Trap server
    await fetch(this._url.href, {
      // *GET, POST, PUT, DELETE, etc.
      method: 'POST',

      // no-cors, *cors, same-origin
      mode: 'cors',

      // *default, no-cache, reload, force-cache, only-if-cached
      cache: 'no-cache',

      // include, *same-origin, omit
      credentials: 'omit',

      // necessary HTTP headers
      headers: {
        // No other headers are allowed in a preflight-less CORS request
        // For details: https://developer.mozilla.org/en-US/docs/Glossary/CORS-safelisted_request_header
        'Content-Type': contentType,
      },

      // manual, *follow, error
      redirect: 'follow',

      // no-referrer, *no-referrer-when-downgrade, origin,
      // origin-when-cross-origin, same-origin, strict-origin,
      // strict-origin-when-cross-origin, unsafe-url
      referrerPolicy: 'origin',

      // data to be sent
      body: final,
    });
  }

  // eslint-disable-next-line class-methods-use-this
  serializeHeader(ts, sessionId, streamId, sequenceNumber, schema) {
    return [
      HEADER_EVENT_TYPE,
      // TODO: merge this with buffer's currentTs
      ts,
      sessionId,
      streamId,
      sequenceNumber,
      schema,
    ];
  }

  // eslint-disable-next-line class-methods-use-this
  serializeMetadata(ts, platform, location, custom, screen, document) {
    return [
      METADATA_EVENT_TYPE,
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

// No default export, just the class
export default HTTP;
