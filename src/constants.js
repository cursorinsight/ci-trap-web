//------------------------------------------------------------------------------
// Copyright (C) 2022- Cursor Insight Ltd.
//
// All rights reserved.
//------------------------------------------------------------------------------
// Configurations and constants for Trap.
//------------------------------------------------------------------------------
// The primary purpose of this module is to let the tests mock these values and
// change them on their own.
//------------------------------------------------------------------------------

/* eslint-disable operator-linebreak, sonarjs/no-duplicate-string */

// Manually managed schema version
export const SCHEMA_VERSION = '20220202T022222Z';

// Check whether the client has touch interface or not
export const TOUCH_ENABLED = 'ontouchstart' in window
                          || 'onmsgesturestart' in window;

// Check whether pointer events are enabled
export const POINTER_ENABLED = 'onpointermove' in window
                            || 'onmspointermove' in window;

// Check whether visibilitychange event is supported
export const VISIBILITY_CHANGE_ENABLED = 'onvisibilitychange' in document
                                      || 'onmozvisibilitychange' in document
                                      || 'onmsvisibilitychange' in document
                                      || 'onwebkitvisibilitychange' in document;

// Check whether freeze event is supported
export const FREEZE_ENABLED = 'onfreeze' in document;

// Monotonously increasing event types
export const HEADER_EVENT_TYPE = -1;
export const MOUSE_MOVE_EVENT_TYPE = 0;
export const CUSTOM_EVENT_TYPE = 1;
export const TOUCH_START_EVENT_TYPE = 2;
export const TOUCH_MOVE_EVENT_TYPE = 3;
export const TOUCH_END_EVENT_TYPE = 4;
export const MOUSE_DOWN_EVENT_TYPE = 5;
export const MOUSE_UP_EVENT_TYPE = 6;
export const BLUR_WINDOW_EVENT_TYPE = 7;
export const FOCUS_WINDOW_EVENT_TYPE = 8;
export const WHEEL_EVENT_TYPE = 9;
export const SCROLL_EVENT_TYPE = 10;
export const METADATA_EVENT_TYPE = 11;

// Default Trap server endpoint
export const DEFAULT_TRAP_SERVER_URL = '?UNCONFIGURED=http';

// Default idle timeout (2 seconds)
export const DEFAULT_TRAP_IDLE_TIMEOUT = 2000;

// Default maximum buffer size (3.600 events ~= 1 minute on 60fps systems)
export const DEFAULT_TRAP_BUFFER_SIZE_LIMIT = 3600;

// Default WebSockets server endpoint
export const DEFAULT_WS_SERVER_URL = '?UNCONFIGURED=ws';

// Default API-KEY key name
export const DEFAULT_TRAP_API_KEY_NAME = 'GRABOXY-API-KEY';

// Default API-KEY value
export const DEFAULT_TRAP_API_KEY_VALUE = 'UNCONFIGURED';

// Check `performance.timeOrigin` support
export const PERFORMANCE_TIMEORIGIN_ENABLED =
  typeof performance.timeOrigin === 'number';

// By default, transport compression is disabled
export const DEFAULT_TRAP_ENABLE_COMPRESSION = false;

// Default time interval between metadata submissions, 1 minute
export const DEFAULT_METADATA_SUBMISSION_INTERVAL = 60 * 1000;

// Build schema
export const SCHEMA = { version: SCHEMA_VERSION };

// Default Tracker object name ('gt'; which assigns Tracker as `window.gt`)
export const DEFAULT_TRACKER_OBJECT_NAME = 'gt';
