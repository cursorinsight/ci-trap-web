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
import HTTP from './transport/http';
import WS from './transport/ws';
import Dummy from './transport/dummy';

import InMemoryEventStorage from './inMemoryEventStorage';

// Metadata
import Metadata from './metadata';
import TimeUtils from './timeUtils';

// Mixins
import disableTouchEventMixin from './disableTouchEventMixin';

// Constants
import {
  CUSTOM_MESSAGE_TYPE,
  HEADER_MESSAGE_TYPE,
  PAGE_STATE_ACTIVE,
  PAGE_STATE_INACTIVE,
} from './constants';

/**
 * Trap class for managing the data collection
 *
 * @class Trap
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
      eventStorage: new InMemoryEventStorage(),
      collectEvents: false,
      captureRequestAnimationFrame: false,
      onDataSubmittedCallback: undefined,
      restartOnBecomingActive: false,
      isRunning: false,
      stopDataCollectionOnPageHide: false,
    };

    this._handlers.on('message', this.pushMessage);
    this._metadata.on('message', this.pushMessage);
    this._handlers.on('requestSubmission', this.submit);
    this._buffer.on('requestSubmission', this.submit);
    this._handlers.on('pageStateChanged', this.onPageStateChanged);
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

  /**
   * Set the appVersion property
   *
   * @param {Array<{
   *  name: string,
   *  version: string,
   *  type: 'library'|'application',
   * }>} components
   */
  components(components) {
    this._metadata.components = components;
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
    if (this.state.captureRequestAnimationFrame) {
      this._handlers.startRequestAnimationFrame();
    }
    this.state.isRunning = true;
  }

  /**
   * Disable/stop data collection
   */
  stop() {
    this.submit(true);
    this._buffer.disable();
    this._metadata.disable();
    this._handlers.stopRequestAnimationFrame();
    this.state.isRunning = false;
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
      return Promise.resolve();
    }

    const events = this._buffer.flush();
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
      this._metadata.schema,
    );
  }

  /**
   * Set application specific, custom metadata key-value pair
   * @deprecated Use addCustomMetadata instead
   *
   * @param {string} key
   * @param {any} value
   */
  metadata(key, value) {
    this.addCustomMetadata(key, value);
  }

  /**
   * Set application specific, custom metadata key-value pair
   *
   * @param {string} key
   * @param {any} value
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
   * @deprecated use setTransportMethod instead
   *
   * @param {boolean} useWsTransport
   */
  setUseWsTransport(useWsTransport) {
    this.setTransportMethod(useWsTransport ? 'ws' : 'http');
  }

  /**
   * Sets the transport method. Specify `ws` for Websocket transport,
   * `http` for HTTP transport. If you specify anything else the data is
   * not submitted to a server.
   * @param {string} transportMethod
   */
  setTransportMethod(transportMethod) {
    this.state.transport.off(
      'dataSubmitted',
      this.state.eventStorage.onDataSubmitted,
    );
    this.state.transport.off(
      'dataSubmitted',
      this.state.onDataSubmittedCallback,
    );
    this.state.transport.close();
    if (transportMethod.startsWith('ws')) {
      this.state.transport = new WS(this._metadata, this.log);
    } else if (transportMethod.startsWith('http')) {
      this.state.transport = new HTTP(this._metadata);
    } else {
      this.state.transport = new Dummy(this._metadata);
    }
    if (this.state.collectEvents) {
      this.state.transport.on(
        'dataSubmitted',
        this.state.eventStorage.onDataSubmitted,
      );
    }
    if (this.state.onDataSubmittedCallback) {
      this.state.transport.on(
        'dataSubmitted',
        this.state.onDataSubmittedCallback,
      );
    }
  }

  /**
   * Enable / disable in-memory collection of events.
   *
   * @param {boolean} collectEvents
   */
  setCollectEvents(collectEvents) {
    this.state.collectEvents = collectEvents;
    if (collectEvents) {
      this.state.transport.on(
        'dataSubmitted',
        this.state.eventStorage.onDataSubmitted,
      );
    } else {
      this.state.transport.off(
        'dataSubmitted',
        this.state.eventStorage.onDataSubmitted,
      );
    }
  }

  /**
   * Set the buffer size limit for in-memory event collection
   *
   * @param {int} sizeLimit
   */
  setEventCollectionSizeLimit(sizeLimit) {
    this.state.eventStorage.sizeLimit = sizeLimit;
  }

  /**
   * Set the metadata submission interval
   *
   * @param {int} metadataSubmissionInterval
   */
  setMetadataSubmissionInterval(metadataSubmissionInterval) {
    this._metadata.metadataSubmissionInterval = metadataSubmissionInterval;
  }

  /**
   * Enable/disable collecting URLs in the metadata
   *
   * @param {boolean} metadataCollectUrls
   */
  setMetadataCollectUrls(metadataCollectUrls) {
    this._metadata.collectUrls = metadataCollectUrls;
  }

  /**
   * Add metadata event to the stream (immediately, independently from the
   * periodic submission)
   *
   */
  submitMetadata() {
    this._metadata.submit();
  }

  /**
   * Enable / disable coalesced pointer event collection
   *
   * @param {bool} capture
   */
  setCaptureCoalescedEvents(capture) {
    this._handlers.captureCoalescedEvents(capture);
  }

  /**
   * Enable / disable requestAnimationFrame message collection
   *
   * @param {bool} capture
   */
  setCaptureRequestAnimationFrame(capture) {
    this.state.captureRequestAnimationFrame = capture;
    if (capture) {
      this._handlers.startRequestAnimationFrame();
    } else {
      this._handlers.stopRequestAnimationFrame();
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
   * Returns a deep copy of the collected events while keeping them unchanged in
   * Trap.
   *
   * @returns {undefined|Array<Array>}
   */
  collectedEvents() {
    return this.state.eventStorage.collectedEvents().concat(
      this._buffer.collectedEvents(),
    );
  }

  /**
   * Returns the number of collected events. If `filterFn` is specified it
   * returns only the events that match the specified filter.
   *
   * @deprecated use collectedEvents instead and do the filtering and counting
   * in the calling application.
   *
   * @param {filterFunction} filterFn
   *
   * @returns {int}
   */
  collectedEventCount(filterFn = () => true) {
    return this.collectedEvents().filter(filterFn).length;
  }

  /**
   * Generate a new streamId
   *
   * @param {boolean} resetStreamId
   */
  generateNewStreamId() {
    this._metadata.generateNewStreamId();
  }

  /**
   * Returns the collected events that have not been flushed yet.
   * Only works if `setCollectEvents(true)` was set before the data collection
   * was performed.
   *
   * @returns {undefined|Array<Array>}
   */
  flushCollectedEvents() {
    return this.state.eventStorage.flushStorage();
  }

  /**
   * Event handler when data is submitted by the transport layer.
   *
   * @param {function(any[]):void} callback
   */
  onDataSubmitted(callback) {
    this.state.transport.off(
      'dataSubmitted',
      this.state.onDataSubmittedCallback,
    );
    this.state.onDataSubmittedCallback = callback;
    if (this.state.onDataSubmittedCallback) {
      this.state.transport.on(
        'dataSubmitted',
        this.state.onDataSubmittedCallback,
      );
    }
  }

  /**
   * `stopDataCollectionOnPageHide` setter
   *
   * @param {boolean} stop
   */
  stopDataCollectionOnPageHide(stop) {
    this.state.stopDataCollectionOnPageHide = stop;
  }

  /**
   * Event handler that is called when the visibility state of the page running
   * the Trap code changes.
   *
   * @private
   *
   * @param {'active'|'inactive'} pageState
   */
  onPageStateChanged(pageState) {
    if (pageState === PAGE_STATE_INACTIVE
       && this.state.isRunning
       && this.state.stopDataCollectionOnPageHide) {
      this.stop();
      this.state.restartOnBecomingActive = true;
    } else if (pageState === PAGE_STATE_ACTIVE
      && this.state.restartOnBecomingActive) {
      this.start();
      this.state.restartOnBecomingActive = false;
    }
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
