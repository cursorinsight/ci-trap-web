//------------------------------------------------------------------------------
// Copyright (C) 2022- Cursor Insight Ltd.
//
// All rights reserved.
//------------------------------------------------------------------------------
// Configurations and constants for Tracker.
//------------------------------------------------------------------------------

/* eslint-disable operator-linebreak */

import {
  DEFAULT_TRAP_SERVER_URL,
  DEFAULT_TRAP_IDLE_TIMEOUT,
  DEFAULT_TRAP_BUFFER_SIZE_LIMIT,
  DEFAULT_TRAP_API_KEY_NAME,
  DEFAULT_TRAP_API_KEY_VALUE,
  DEFAULT_TRAP_ENABLE_COMPRESSION,
  DEFAULT_TRACKER_OBJECT_NAME,
  DEFAULT_TRAP_USE_WS_TRANSPORT,
} from './constants';

// Default Trap server endpoint
export const TRAP_SERVER_URL = process.env.APP_DEFAULT_TRAP_SERVER_URL
  || DEFAULT_TRAP_SERVER_URL;

// Default idle timeout (2 seconds)
export const TRAP_IDLE_TIMEOUT = process.env.APP_DEFAULT_TRAP_IDLE_TIMEOUT
  || DEFAULT_TRAP_IDLE_TIMEOUT;

// Default maximum buffer size (3.600 events ~= 1 minute on 60fps systems)
export const TRAP_BUFFER_SIZE_LIMIT =
  process.env.APP_DEFAULT_TRAP_BUFFER_SIZE_LIMIT
  || DEFAULT_TRAP_BUFFER_SIZE_LIMIT;

// Default API-KEY key name
export const TRAP_API_KEY_NAME = process.env.APP_DEFAULT_TRAP_API_KEY_NAME
  || DEFAULT_TRAP_API_KEY_NAME;

// Default API-KEY value
export const TRAP_API_KEY_VALUE = process.env.APP_DEFAULT_TRAP_API_KEY_VALUE
  || DEFAULT_TRAP_API_KEY_VALUE;

export const TRAP_ENABLE_COMPRESSION =
  process.env.APP_DEFAULT_TRAP_ENABLE_COMPRESSION
  || DEFAULT_TRAP_ENABLE_COMPRESSION;

export const TRACKER_OBJECT_NAME = process.env.APP_DEFAULT_TRACKER_OBJECT_NAME
  || DEFAULT_TRACKER_OBJECT_NAME;

export const TRAP_USE_WS_TRANSPORT =
  process.env.APP_DEFAULT_TRAP_USE_WS_TRANSPORT
  || DEFAULT_TRAP_USE_WS_TRANSPORT;
