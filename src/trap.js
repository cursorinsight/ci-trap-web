//------------------------------------------------------------------------------
// Copyright (C) 2014- Cursor Insight Ltd.
//
// All rights reserved.
//------------------------------------------------------------------------------
// Cursor Insight's Trap is a lightweight event tracker for the browser.
//------------------------------------------------------------------------------

// Utilities
import simpleAutoBind from './simpleAutoBind';

// Event handlers
import Handlers from './handlers';

// Event buffer
import Buffer from './buffer';

// Transport implementations
import HTTP from './http';
import WS from './ws';

// Metadata
import Metadata from './metadata';
import TimeUtils from './timeUtils';

// Mixins
import disableTouchEventMixin from './disableTouchEventMixin';

// Constants
import {
  CUSTOM_MESSAGE_TYPE,
  HEADER_MESSAGE_TYPE,
  SCHEMA,
} from './constants';

class Trap {
  // Trap constructor
  constructor() {
    simpleAutoBind(this);

    // Initialize buffer to store collected events before sending
    this._buffer = new Buffer(this);

    // Initialize metadata handler
    this._metadata = new Metadata();

    // Initialize DOM event handlers
    this._handlers = new Handlers();

    // Mutable state
    //
    // A frozen instance is immutable, thus it can not directly have a single
    // value that is modified during runtime. `state` is an internal object that
    // can be modified according to our needs.
    this.state = {
      // Default logger sends logs to console
      // eslint-disable-next-line no-console
      logger: (...m) => { console.log(...m); },
      transport: new HTTP(this._metadata, this._buffer),
      sequenceNumber: 0,
    };

    this._handlers.on('message', this.pushMessage);
    this._metadata.on('message', this.pushMessage);
    this._handlers.on('requestSubmission', this.submit);
    this._buffer.on('requestSubmission', this.submit);
    // Prepare current instance to freeze
    if (!Trap.instance) { Trap.instance = this; }
  }

  // Metadata API

  // `streamId` getter
  streamId() {
    return this._metadata.streamId;
  }

  // `sessionId` getter
  sessionId() {
    return this._metadata.sessionId;
  }

  // Set API key header name
  apiKeyName(apiKeyName) {
    this._metadata.apiKeyName = apiKeyName;
  }

  // Set API key value that is used to identify a client
  apiKeyValue(apiKeyValue) {
    this._metadata.apiKeyValue = apiKeyValue;
  }

  // Deprecated alias of `apiKeyValue` setter
  apiKey(apiKeyValue) {
    this._metadata.apiKeyValue = apiKeyValue;
  }

  // Handler API

  // Mount Trap to a DOM element
  mount(element) {
    return this._handlers.mount(element);
  }

  // Umount Trap from a DOM element
  umount(element) {
    return this._handlers.umount(element);
  }

  // Set Buffer's idleTimeout
  idleTimeout(idleTimeout) {
    this._buffer.idleTimeout = idleTimeout;
  }

  // Enable/start data collection
  start() {
    this._buffer.enable();
    this.addHeaderToBuffer();
    this._metadata.enable();
  }

  // Disable/stop data collection
  stop() {
    this._buffer.disable();
    this._metadata.disable();
  }

  // `bufferSizeLimit` setter proxy
  bufferSizeLimit(bufferSizeLimit) {
    this._buffer.bufferSizeLimit = bufferSizeLimit;
  }

  // `bufferTimeout` setter proxy
  bufferTimeout(bufferTimeout) {
    this._buffer.bufferTimeout = bufferTimeout;
  }

  // `enableCompression` setter proxy
  enableCompression(enableCompression) {
    this.state.transport.enableCompression = enableCompression;
  }

  // Remote Trap server URL setter
  url(url) {
    this.state.transport.url = url;
  }

  // Inject and later send custom event to stream
  send(props) {
    if (typeof props === 'string') {
      this.pushMessage([
        CUSTOM_MESSAGE_TYPE,
        TimeUtils.currentTs(),
        { message: props },
      ]);
    } else if (typeof props === 'object') {
      this.pushMessage([
        CUSTOM_MESSAGE_TYPE,
        TimeUtils.currentTs(),
        props,
      ]);
    }
  }

  pushMessage(message) {
    this._buffer.push(...message);
  }

  // Submit data manually
  submit(final) {
    if (this._buffer.isEmpty()) {
      return new Promise(() => { });
    }

    const events = this._buffer.flush();
    if (!final) {
      this.addHeaderToBuffer();
    }
    return this.state.transport.submit(events);
  }

  addHeaderToBuffer() {
    // eslint-disable-next-line no-plusplus
    const sequenceNumber = this.state.sequenceNumber++;

    this._buffer.addHeaderItem(
      HEADER_MESSAGE_TYPE,
      TimeUtils.currentTs(),
      this._metadata.sessionId,
      this._metadata.streamId,
      sequenceNumber,
      SCHEMA,
    );
  }

  // Set application specific, custom metadata key-value pair
  metadata(key, value) {
    this.addCustomMetadata(key, value);
  }

  // Set application specific, custom metadata key-value pair
  addCustomMetadata(key, value) {
    this._metadata.set(key, value);
  }

  // Remove application specific, custom metadata by key
  removeCustomMetadata(key) {
    this._metadata.remove(key);
  }

  // Return application specified custom metadata
  customMetadata() {
    return this._metadata.custom;
  }

  // TODO: remove this if it is unnecessary
  //
  // Set log destination helper to an element
  setLogDestination(destination) {
    switch (typeof destination) {
      case 'string':
        // eslint-disable-next-line no-param-reassign
        destination = document.getElementById(destination);
        // destination will flow into the next case block!
      case 'object': // eslint-disable-line no-fallthrough
        this.state.logger = (...m) => {
          // eslint-disable-next-line no-param-reassign
          destination.innerHTML = `${m.join()}\n${destination.innerHTML}`;
        };
        break;
      default:
        // eslint-disable-next-line no-console
        this.state.logger = (...m) => { console.log(...m); };
    }
  }

  setUseWsTransport(useWsTransport) {
    this.state.transport.close();

    if (useWsTransport) {
      this.state.transport = new WS(this._metadata, this._buffer, this.log);
    } else {
      this.state.transport = new HTTP(this._metadata, this._buffer);
    }
  }

  // Log arbitrary messages
  log(...props) {
    this.state.logger(...props);
  }
}

// Append mixins
Object.assign(Trap.prototype, disableTouchEventMixin);

// Make it a singleton instance
const instance = new Trap();
Object.freeze(instance);

// Export the singleton instance as default
export default instance;

// Also export class to let other developers use for whatever reason they want
// to use it.
export { Trap };
