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

/**
 * Trap class for managing the data collection
 *
 * @class Trap
 * @typedef {Trap}
 */
class Trap {
  /**
   * Creates an instance of Trap.
   *
   * @constructor
   */
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
      eventCount: 0,
    };

    this._handlers.on('message', this.pushMessage);
    this._metadata.on('message', this.pushMessage);
    this._handlers.on('requestSubmission', this.submit);
    this._buffer.on('requestSubmission', this.submit);
    // Prepare current instance to freeze
    if (!Trap.instance) { Trap.instance = this; }
  }

  // Metadata API

  /**
   * `streamId` getter
   *
   * @returns {string}
   */
  streamId() {
    return this._metadata.streamId;
  }

  /**
   * `sessionId` getter
   *
   * @returns {string}
   */
  sessionId() {
    return this._metadata.sessionId;
  }

  /**
   * Set API key header name
   *
   * @param {string} apiKeyName
   */
  apiKeyName(apiKeyName) {
    this._metadata.apiKeyName = apiKeyName;
  }

  /**
   * Set API key value that is used to identify the integrator
   * organization/person who uses the data collection library.
   *
   * @param {string} apiKeyValue
   */
  apiKeyValue(apiKeyValue) {
    this._metadata.apiKeyValue = apiKeyValue;
  }

  /**
   * Deprecated alias of `apiKeyValue` setter
   * @deprecated use apiKeyValue instead
   *
   * @param {string} apiKeyValue
   */
  apiKey(apiKeyValue) {
    this._metadata.apiKeyValue = apiKeyValue;
  }

  // Handler API

  /**
   * Mount Trap to a DOM element
   *
   * @param {EventTarget} element
   */
  mount(element) {
    this._handlers.mount(element);
  }

  /**
   * Umount Trap from a DOM element
   *
   * @param {EventTarget} element
   */
  umount(element) {
    this._handlers.umount(element);
  }

  /**
   * Set Buffer's idleTimeout
   *
   * @param {number} idleTimeout
   */
  idleTimeout(idleTimeout) {
    this._buffer.idleTimeout = idleTimeout;
  }

  /**
   * Enable/start data collection
   */
  start() {
    this._buffer.enable();
    this.addHeaderToBuffer();
    this._metadata.enable();
  }

  /**
   * Disable/stop data collection
   */
  stop() {
    this._buffer.disable();
    this._metadata.disable();
  }

  /**
   * `bufferSizeLimit` setter proxy
   *
   * @param {number} bufferSizeLimit
   */
  bufferSizeLimit(bufferSizeLimit) {
    this._buffer.bufferSizeLimit = bufferSizeLimit;
  }

  /**
   * `bufferTimeout` setter proxy
   *
   * @param {number} bufferTimeout
   */
  bufferTimeout(bufferTimeout) {
    this._buffer.bufferTimeout = bufferTimeout;
  }

  /**
   * `enableCompression` setter proxy
   *
   * @param {boolean} enableCompression
   */
  enableCompression(enableCompression) {
    this.state.transport.enableCompression = enableCompression;
  }

  /**
   * Remote Trap server URL setter
   *
   * @param {string} url
   */
  url(url) {
    this.state.transport.url = url;
  }

  /**
   * Inject and later send custom event to stream
   *
   * @param {string|object} props
   */
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

  /**
   * Add message to buffer
   * @private
   *
   * @param {*} message
   */
  pushMessage(message) {
    this._buffer.push(...message);
  }

  /**
   * Submit data manually
   *
   * @param {boolean} final
   * @returns {Promise<void>}
   */
  submit(final) {
    if (this._buffer.isEmpty()) {
      return new Promise(() => { });
    }

    const events = this._buffer.flush();
    this.state.eventCount += events.length;
    if (!final) {
      this.addHeaderToBuffer();
    }
    return this.state.transport.submit(events);
  }

  /**
   * Add the header message to the buffer
   * @private
   */
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

  /**
   * Set application specific, custom metadata key-value pair
   * @deprecated Use addCustomMetadata instead
   *
   * @param {string} key
   * @param {string} value
   */
  metadata(key, value) {
    this.addCustomMetadata(key, value);
  }

  /**
   * Set application specific, custom metadata key-value pair
   *
   * @param {string} key
   * @param {string} value
   */
  addCustomMetadata(key, value) {
    this._metadata.set(key, value);
  }

  /**
   * Remove application specific, custom metadata by key
   *
   * @param {string} key
   */
  removeCustomMetadata(key) {
    this._metadata.remove(key);
  }

  /**
   * Return application specified custom metadata
   *
   * @returns {object}
   */
  customMetadata() {
    return this._metadata.custom;
  }

  /**
   * Set log destination helper to an element
   *
   * TODO: remove this if it is unnecessary
   *
   * @param {string|object|any} destination
   */
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

  /**
   * Sets the transport method. `True` sets WS, `False` sets HTTP method.
   *
   * @param {boolean} useWsTransport
   */
  setUseWsTransport(useWsTransport) {
    this.state.transport.close();

    if (useWsTransport) {
      this.state.transport = new WS(this._metadata, this._buffer, this.log);
    } else {
      this.state.transport = new HTTP(this._metadata, this._buffer);
    }
  }

  /**
   * Log arbitrary messages
   *
   * @param {...any} props
   */
  log(...props) {
    this.state.logger(...props);
  }

  /**
   * Return the number of events captured since start
   *
   * @returns {int}
   */
  eventCount() {
    return this.state.eventCount + this._buffer.eventCount();
  }

  /**
   * Reset event count
   */
  resetEventCount() {
    this.state.eventCount = 0;
  }

}

// Append mixins
Object.assign(Trap.prototype, disableTouchEventMixin);

/**
 * Singleton instance of Trap
 *
 * @type {Trap}
 */
const instance = new Trap();
Object.freeze(instance);

// Export the singleton instance as default
export default instance;

// Also export class to let other developers use for whatever reason they want
// to use it.
export { Trap };
