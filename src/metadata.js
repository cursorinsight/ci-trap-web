//------------------------------------------------------------------------------
// Copyright (C) 2023- Cursor Insight Ltd.
//
// All rights reserved.
//------------------------------------------------------------------------------
// Metadata handler.
//
// This module manages static, immutable constants for a stream e.g.
// `sessionId` or `streamId`; custom, user-defined metadata; and platform-,
// machine- and DOM-specific metadata as well.
//------------------------------------------------------------------------------

import { v4 as uuidv4 } from 'uuid';
import Cookies from 'js-cookie';
import Platform from 'platform';

import simpleAutoBind from './simpleAutoBind';
import eventEmitterMixin from './eventEmitterMixin';
import TimeUtils from './timeUtils';

// Constants
import {
  DEFAULT_TRAP_API_KEY_NAME,
  DEFAULT_TRAP_API_KEY_VALUE,
  DEFAULT_METADATA_SUBMISSION_INTERVAL,
  METADATA_MESSAGE_TYPE,
} from './constants';

class Metadata {
  constructor() {
    simpleAutoBind(this);

    // Unique session id -- that represents a unique browser; load or set up a
    // new cookie
    this._sessionId = (() => {
      let sessionId = Cookies.get('sessionId');
      if (typeof sessionId !== 'string') {
        sessionId = uuidv4();
        Cookies.set(
          'sessionId',
          sessionId,
          { path: '/', sameSite: 'none', secure: true },
        );
      }
      return sessionId;
    })();

    // Unique stream id to identify browser sessions, i.e. page loads
    this.generateNewStreamId();

    // Custom metadata store
    this._customMetadata = {};

    // Key name of the "API key"
    this._apiKeyName = DEFAULT_TRAP_API_KEY_NAME;

    // API key that is used to distinguish clients
    this._apiKeyValue = DEFAULT_TRAP_API_KEY_VALUE;

    // Default submission inverval
    this._metadataSubmissionInterval = DEFAULT_METADATA_SUBMISSION_INTERVAL;
  }

  // Return current sessionId
  get sessionId() {
    return this._sessionId;
  }

  // Return current streamId
  get streamId() {
    return this._streamId;
  }

  // Return current API key name
  get apiKeyName() {
    return this._apiKeyName;
  }

  // Set current API key name
  set apiKeyName(apiKeyName) {
    this._apiKeyName = apiKeyName;
  }

  // Return current API key value
  get apiKeyValue() {
    return this._apiKeyValue;
  }

  // Set current API key value
  set apiKeyValue(apiKeyValue) {
    this._apiKeyValue = apiKeyValue;
  }

  // Return current submission interval
  get metadataSubmissionInterval() {
    return this._metadataSubmissionInterval;
  }

  // Set current submission interval
  set metadataSubmissionInterval(metadataSubmissionInterval) {
    this._metadataSubmissionInterval = metadataSubmissionInterval;
    // Recreate the timer
    if (this._submissionTimer !== undefined) {
      window.clearInterval(this._submissionTimer);
      this._submissionTimer = window.setInterval(
        this.submit,
        this.metadataSubmissionInterval,
      );
    }
  }

  // Enable periodical metadata submission
  enable() {
    if (this._submissionTimer === undefined) {
      this._submissionTimer = window.setInterval(
        this.submit,
        this.metadataSubmissionInterval,
      );
      this.submit();
    }
  }

  // Disable metadata submission
  disable() {
    if (this._submissionTimer !== undefined) {
      window.clearInterval(this._submissionTimer);
      this._submissionTimer = undefined;
    }
  }

  submit() {
    this.emit('message', this.serializeMetadata());
  }

  reset() {
    this.disable();
    this.enable();
  }

  // Generates a new streamId
  generateNewStreamId() {
    this._streamId = uuidv4();
  }

  serializeMetadata() {
    return [
      METADATA_MESSAGE_TYPE,
      TimeUtils.currentTs(),
      {
        platform: this.platform,
        location: this.location,
        custom: this.custom,
        screen: this.screen,
        document: this.document,
      },
    ];
  }

  // Set custom metadata key/value pair
  set(key, value) {
    this._customMetadata[key] = value;
    this.submit();
  }

  // Remove custom metadata by key
  remove(key) {
    delete this._customMetadata[key];
    this.submit();
  }

  // Return custom, user-defined metadata
  get custom() {
    return this._customMetadata;
  }

  // Return platform (browser & OS) metadata
  // eslint-disable-next-line class-methods-use-this
  get platform() {
    return {
      description: Platform.description,
      layout: Platform.layout,
      manufacturer: Platform.manufacturer,
      name: Platform.name,
      prerelease: Platform.prerelease,
      product: Platform.product,
      ua: Platform.ua,
      version: Platform.version,
      os: {
        architecture: Platform.os.architecture,
        family: Platform.os.family,
        version: Platform.os.version,
      },
    };
  }

  // Return location metadata -- i.e. URL data
  // eslint-disable-next-line class-methods-use-this
  get location() {
    return {
      current: window.location.href,
      previous: document.referrer,
    };
  }

  get screen() {
    const { screen } = window;
    return { // screen metadata
      availHeight: screen.availHeight,
      availWidth: screen.availWidth,
      availLeft: screen.availLeft,
      availTop: screen.availTop,
      height: screen.height,
      width: screen.width,
      top: screen.top,
      left: screen.left,
      colorDepth: screen.colorDepth,
      pixelDepth: screen.pixelDepth,
      devicePixelRatio: window.devicePixelRatio,
      orientation: { ...(this.orientation) },
    };
  }

  // Assemble browser orientation related metadata
  // eslint-disable-next-line class-methods-use-this
  get orientation() {
    let orientationType;
    let orientationAngle;

    if (window.screen.orientation) {
      orientationType = window.screen.orientation.type;
      orientationAngle = window.screen.orientation.angle;
    } else if (typeof window.orientation === 'number') {
      if (Math.abs(window.orientation) === 90) {
        orientationType = 'landscape';
      } else {
        orientationType = 'portrait';
      }
      orientationAngle = window.orientation;
    }

    return {
      type: orientationType,
      angle: orientationAngle,
    };
  }

  // Return document metadata
  // eslint-disable-next-line class-methods-use-this
  get document() {
    const { documentElement } = document;
    return {
      scrollLeft: documentElement.scrollLeft,
      scrollTop: documentElement.scrollTop,
      scrollHeight: documentElement.scrollHeight,
      scrollWidth: documentElement.scrollWidth,
      offsetHeight: documentElement.offsetHeight,
      offsetWidth: documentElement.offsetWidth,
      clientTop: documentElement.clientTop,
      clientLeft: documentElement.clientLeft,
      clientHeight: documentElement.clientHeight,
      clientWidth: documentElement.clientWidth,
    };
  }
}

Object.assign(Metadata.prototype, eventEmitterMixin);

export default Metadata;
