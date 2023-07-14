//------------------------------------------------------------------------------
// Copyright (C) 2022- Cursor Insight Ltd.
//
// All rights reserved.
//------------------------------------------------------------------------------
// WebSocket transport for Cursor Insight's ligthweight mouse tracker.
//------------------------------------------------------------------------------

import simpleAutoBind from './simpleAutoBind';
import Transport from './transport';

class WS extends Transport {
  constructor(metadata, buffer, logger) {
    super(metadata, buffer);
    simpleAutoBind(this);

    this._logger = logger;

    // Server socket
    this._socket = null;
  }

  // `enableCompression` setter
  set enableCompression(_enableCompression) {
    this.logger('unnecessary enableCompression call');
  }

  // `url` setter
  set url(url) {
    if (this._socket) {
      this._socket.close();
      this._socket = null;
    }
    this._url = this.createUrl(url);
  }

  // Submit
  async submit(buffer) {
    // Current timestamp
    const currentTs = this._buffer.currentTs();

    // Add metaData if it hasn't been submitted recently
    this.maybeAddMetadataToBuffer(buffer, currentTs);

    // Initialize socket -- if null
    if (this._socket === null) {
      await this.initializeSocket();

      // TODO: send session metadata
      this.addHeaderToBuffer(buffer);
    }

    // Save last submission's timestamp -- for the next run
    this._lastSubmissionTs = currentTs;

    // Send data
    await this._socket.send(JSON.stringify(buffer));
  }

  async initializeSocket() {
    const url = this._url;

    if (!url.protocol.match('ws') && url.protocol.match('http')) {
      url.protocol = url.protocol.replace('http', 'ws');
    }

    this._socket = new WebSocket(url);
    await this.setupListenersOnConnect();
  }

  setupListenersOnConnect() {
    const socket = this._socket;

    return new Promise((resolve, reject) => {
      const handleOpen = () => {
        socket.addEventListener('close', () => {
          this._logger('WebsSocket connection closed');
          this._socket = null;
        });
        resolve();
      };

      const handleError = (event) => {
        this._logger(`WebSocket connection error: ${event}`);
        reject();
      };

      socket.addEventListener('error', handleError);
      socket.addEventListener('open', handleOpen);
    });
  }

  // Closes the current transport channel. It closes the connection to the
  // server.
  close() {
    if (this._socket != null) {
      this._socket.close();
    }
    this.reset();
  }
}

export default WS;
