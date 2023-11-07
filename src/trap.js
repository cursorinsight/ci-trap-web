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
} from './constants';

class Trap {
  // Trap constructor
  constructor() {
    simpleAutoBind(this);

    // Initialize buffer to store collected events before sending
    this._buffer = new Buffer(this);

    // Initialize metadata handler
    this._metadata = new Metadata(this._buffer);

    // Initialize DOM event handlers
    this._handlers = new Handlers(this._buffer);

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
    };

    // Prepare current instance to freeze
    if (!Trap.instance) { Trap.instance = this; }
  }

  // Inter-module communications
  //
  // TODO: refactor Buffer -> Transport messaging and remove this function
  get transport() {
    return this.state.transport;
  }

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

  // `enableCompression` setter proxy
  enableCompression(enableCompression) {
    this.transport.enableCompression = enableCompression;
  }

  // Remote Trap server URL setter
  url(url) {
    this.transport.url = url;
  }

  // Inject and later send custom event to stream
  send(props) {
    if (typeof props === 'string') {
      this._buffer.push(
        CUSTOM_MESSAGE_TYPE,
        TimeUtils.currentTs(),
        { message: props });
    } else if (typeof props === 'object') {
      this._buffer.push(
        CUSTOM_MESSAGE_TYPE,
        TimeUtils.currentTs(),
        props);
    }
  }

  // Submit data manually
  submit() {
    return this._buffer.submit();
  }

  // Set application specific, custom metadata key-value pair
  metadata(key, value) {
    this._metadata.set(key, value);
  }

  // Return application specified custom metadata
  customMetadata() {
    return this._metadata.custom;
  }

  // Reset internal state -- it is useful for resetting state between tests
  //
  // TODO: refactor and preferably remove this code
  reset() {
    this.transport.reset();
    this._metadata.reset();
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
