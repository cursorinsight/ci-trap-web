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
export const SCHEMA_VERSION = '1-0-0';

// This is updated by npm version command
export const PACKAGE_VERSION = '1.0.22';

// Constants to define the current component in the schema
export const PACKAGE_NAME = 'ci-trap-web';
export const PACKAGE_TYPE = 'collector';

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
export const HEADER_MESSAGE_TYPE = -1;
export const MOUSE_MOVE_MESSAGE_TYPE = 0;
export const CUSTOM_MESSAGE_TYPE = 1;
export const TOUCH_START_MESSAGE_TYPE = 2;
export const TOUCH_MOVE_MESSAGE_TYPE = 3;
export const TOUCH_END_MESSAGE_TYPE = 4;
export const MOUSE_DOWN_MESSAGE_TYPE = 5;
export const MOUSE_UP_MESSAGE_TYPE = 6;
export const BLUR_WINDOW_MESSAGE_TYPE = 7;
export const FOCUS_WINDOW_MESSAGE_TYPE = 8;
export const WHEEL_MESSAGE_TYPE = 9;
export const SCROLL_MESSAGE_TYPE = 10;
export const METADATA_MESSAGE_TYPE = 11;
export const REQUEST_ANIMATION_FRAME_MESSAGE_TYPE = 20;

// Default Trap server endpoint
export const DEFAULT_TRAP_SERVER_URL = '?UNCONFIGURED=http';

// Default idle timeout (2 seconds)
export const DEFAULT_TRAP_IDLE_TIMEOUT = 2000;

// Default inactive timeout (59 seconds)
export const DEFAULT_TRAP_INACTIVE_TIMEOUT = 59 * 1000;

// Default maximum buffer size (3.600 events ~= 1 minute on 60fps systems)
export const DEFAULT_TRAP_BUFFER_SIZE_LIMIT = 3600;

// Default timeout for sending the buffer automatically (in milliseconds;
// default is 2 minutes)
export const DEFAULT_TRAP_BUFFER_TIMEOUT = 120000;

// Default WebSockets server endpoint
export const DEFAULT_WS_SERVER_URL = '?UNCONFIGURED=ws';

// Default API-KEY key name
export const DEFAULT_TRAP_API_KEY_NAME = 'GRABOXY-API-KEY';

// Default API-KEY value
export const DEFAULT_TRAP_API_KEY_VALUE = 'UNCONFIGURED';

// By default, transport compression is disabled
export const DEFAULT_TRAP_ENABLE_COMPRESSION = false;

// Default time interval between metadata submissions, 1 minute
export const DEFAULT_METADATA_SUBMISSION_INTERVAL = 60 * 1000;

// Default settings for collecting URLS in the metadata
export const DEFAULT_METADATA_COLLECT_URLS = true;

// Default Tracker object name ('gt'; which assigns Tracker as `window.gt`)
export const DEFAULT_TRACKER_OBJECT_NAME = 'gt';

// By default use HTTP transport
export const DEFAULT_TRAP_USE_WS_TRANSPORT = false;

// Default maximum number of in memory collected events
export const DEFAULT_TRAP_IN_MEMORY_STORAGE_SIZE_LIMIT = 10000;

// Page state when the page is focused
export const PAGE_STATE_ACTIVE = 'active';

// Page state when the page is not focused
export const PAGE_STATE_INACTIVE = 'inactive';
