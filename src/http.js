//------------------------------------------------------------------------------
// Copyright (C) 2022- Cursor Insight Ltd.
//
// All rights reserved.
//------------------------------------------------------------------------------
// HTTP transport for Cursor Insight's ligthweight mouse tracker.
//------------------------------------------------------------------------------

import { strToU8, zlibSync } from 'fflate';

import Transport from './transport';
import simpleAutoBind from './simpleAutoBind';

class HTTP extends Transport {
  constructor(metadata, buffer) {
    super(metadata, buffer);
    simpleAutoBind(this);
  }

  // `enableCompression` setter
  set enableCompression(enableCompression) {
    this._enableCompression = !!enableCompression;
  }

  // Submit data to remote Trap server
  //
  // Since `Array.concat()` and `+` copies the entire array, `buffer` is
  // extended with a `header` and `metadata` using an unconventional
  // `unshift()` call.
  async submit(buffer) {
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

  // Closes the current transport channel.
  // eslint-disable-next-line class-methods-use-this
  close() {
    // In case of HTTP there is no active connection, so nothing to do.
  }
}

// No default export, just the class
export default HTTP;
