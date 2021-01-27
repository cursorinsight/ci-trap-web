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

// Constants
import {
  DEFAULT_TRAP_API_KEY_NAME,
  DEFAULT_TRAP_API_KEY_VALUE,
} from './constants';

export default class Metadata {
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
    this._streamId = uuidv4();

    // Custom metadata store
    this._customMetadata = {};

    // Key name of the "API key"
    this._apiKeyName = DEFAULT_TRAP_API_KEY_NAME;

    // API key that is used to distinguish clients
    this._apiKeyValue = DEFAULT_TRAP_API_KEY_VALUE;
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

  // Set custom metadata key/value pair
  set(key, value) {
    this._customMetadata[key] = value;
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
    return { // screen metadata
      availHeight: window.screen.availHeight,
      availWidth: window.screen.availWidth,
      availLeft: window.screen.availLeft,
      availTop: window.screen.availTop,
      height: window.screen.height,
      width: window.screen.width,
      top: window.screen.top,
      left: window.screen.left,
      colorDepth: window.screen.colorDepth,
      pixelDepth: window.screen.pixelDepth,
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
    return {
      scrollLeft: document.documentElement.scrollLeft,
      scrollTop: document.documentElement.scrollTop,
      scrollHeight: document.documentElement.scrollHeight,
      scrollWidth: document.documentElement.scrollWidth,
      offsetHeight: document.documentElement.offsetHeight,
      offsetWidth: document.documentElement.offsetWidth,
      clientTop: document.documentElement.clientTop,
      clientLeft: document.documentElement.clientLeft,
      clientHeight: document.documentElement.clientHeight,
      clientWidth: document.documentElement.clientWidth,
    };
  }
}
