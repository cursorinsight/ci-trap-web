# Schema

## Message types

```
HEADER_MESSAGE_TYPE = -1;
MOUSE_MOVE_MESSAGE_TYPE = 0;
CUSTOM_MESSAGE_TYPE = 1;
TOUCH_START_MESSAGE_TYPE = 2;
TOUCH_MOVE_MESSAGE_TYPE = 3;
TOUCH_END_MESSAGE_TYPE = 4;
MOUSE_DOWN_MESSAGE_TYPE = 5;
MOUSE_UP_MESSAGE_TYPE = 6;
BLUR_WINDOW_MESSAGE_TYPE = 7;
FOCUS_WINDOW_MESSAGE_TYPE = 8;
WHEEL_MESSAGE_TYPE = 9;
SCROLL_MESSAGE_TYPE = 10;
METADATA_MESSAGE_TYPE = 11;
```

## Version `20220202T022222Z`

```
{
  "$id": "https://json-schema.hyperjump.io/schema",
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "array",
  "items": {
    "oneOf": [{
        "$ref": "#/$defs/headerEvent"
      },
      {
        "$ref": "#/$defs/mouseDownEvent"
      },
      {
        "$ref": "#/$defs/mouseMoveEvent"
      },
      {
        "$ref": "#/$defs/mouseUpEvent"
      },
      {
        "$ref": "#/$defs/touchStartEvent"
      },
      {
        "$ref": "#/$defs/touchMoveEvent"
      },
      {
        "$ref": "#/$defs/touchEndEvent"
      },
      {
        "$ref": "#/$defs/customEvent"
      },
      {
        "$ref": "#/$defs/blurWindowEvent"
      },
      {
        "$ref": "#/$defs/focusWindowEvent"
      },
      {
        "$ref": "#/$defs/wheelEvent"
      },
      {
        "$ref": "#/$defs/scrollEvent"
      },
      {
        "$ref": "#/$defs/metadataEvent"
      }
    ]
  },
  "$defs": {
    "headerEvent": {
      "type": "array",
      "title": "Header event",
      "description": "Header event is the first event in a stream",
      "prefixItems": [{
          "title": "Event type",
          "type": "integer",
          "const": -1
        },
        {
          "$ref": "#/$defs/timestamp"
        },
        {
          "title": "Session id",
          "type": "string"
        },
        {
          "title": "Stream id",
          "type": "string"
        },
        {
          "title": "Sequence number",
          "type": "integer"
        },
        {
          "title": "Schema information",
          "type": "object",
          "description":
            "Information about the schema, that helps parsing the data on the server side. Currently it contains only version information, in the future it might contain the entire schema definition",
          "properties": {
            "version": {
              "type": "string",
              "description": "Id of the schema version, currently: 20220202T022222Z"
            }
          },
          "required": ["version"]
        }
      ]
    },
    "mouseDownEvent": {
      "type": "array",
      "title": "Mouse down event",
      "description": "Sent when a mouse button is pressed",
      "prefixItems": [{
          "title": "Event type",
          "type": "integer",
          "const": 5
        },
        {
          "$ref": "#/$defs/timestamp"
        },
        {
          "title": "X",
          "type": "number"
        },
        {
          "title": "Y",
          "type": "number"
        },
        {
          "title": "Button",
          "description": "Id of the currently pressed button",
          "type": "number"
        },
        {
          "title": "Buttons",
          "description": "Id of the pressed buttons",
          "type": "number"
        }
      ]
    },
    "mouseMoveEvent": {
      "type": "array",
      "title": "Mouse move event",
      "description": "Sent when the mouse is moved",
      "prefixItems": [{
          "title": "Event type",
          "type": "integer",
          "const": 0
        },
        {
          "$ref": "#/$defs/timestamp"
        },
        {
          "title": "X",
          "type": "number"
        },
        {
          "title": "Y",
          "type": "number"
        },
        {
          "title": "Buttons",
          "description": "Id of the pressed buttons",
          "type": "number"
        }
      ]
    },
    "mouseUpEvent": {
      "type": "array",
      "title": "Mouse up event",
      "description": "Sent when a mouse button is released",
      "prefixItems": [{
          "title": "Event type",
          "type": "integer",
          "const": 6
        },
        {
          "$ref": "#/$defs/timestamp"
        },
        {
          "title": "X",
          "type": "number"
        },
        {
          "title": "Y",
          "type": "number"
        },
        {
          "title": "Button",
          "description": "Id of the currently pressed button",
          "type": "number"
        },
        {
          "title": "Buttons",
          "description": "Id of the pressed buttons",
          "type": "number"
        }
      ]
    },
    "touchStartEvent": {
      "type": "array",
      "title": "Touch start event",
      "description": "Sent when a finger for a given event touches the surface",
      "prefixItems": [{
          "title": "Event type",
          "type": "integer",
          "const": 2
        },
        {
          "$ref": "#/$defs/timestamp"
        },
        {
          "title": "Id",
          "description": "Identifier that uniquely identifies the touch",
          "type": "number"
        },
        {
          "title": "Screen X",
          "type": "number"
        },
        {
          "title": "Screen Y",
          "type": "number"
        }
      ]
    },
    "touchMoveEvent": {
      "type": "array",
      "title": "Touch move event",
      "description": "Sent when a given touch moves on the surface",
      "prefixItems": [{
          "title": "Event type",
          "type": "integer",
          "const": 3
        },
        {
          "$ref": "#/$defs/timestamp"
        },
        {
          "title": "Id",
          "description": "Identifier that uniquely identifies the touch",
          "type": "number"
        },
        {
          "title": "Screen X",
          "type": "number"
        },
        {
          "title": "Screen Y",
          "type": "number"
        }
      ]
    },
    "touchEndEvent": {
      "type": "array",
      "title": "Touch end event",
      "description": "Sent when a given event lifts from the surface",
      "prefixItems": [{
          "title": "Event type",
          "type": "integer",
          "const": 4
        },
        {
          "$ref": "#/$defs/timestamp"
        },
        {
          "title": "Id",
          "description": "Identifier that uniquely identifies the touch",
          "type": "number"
        },
        {
          "title": "Screen X",
          "type": "number"
        },
        {
          "title": "Screen Y",
          "type": "number"
        }
      ]
    },
    "customEvent": {
      "type": "array",
      "title": "Custom event",
      "description": "Custom event with arbitrary data",
      "prefixItems": [{
          "title": "Event type",
          "type": "integer",
          "const": 1
        },
        {
          "$ref": "#/$defs/timestamp"
        },
        {
          "title": "Custom data",
          "type": "object"
        }
      ]
    },
    "blurWindowEvent": {
      "type": "array",
      "title": "Blur window event",
      "description": "Focus leaves window event",
      "prefixItems": [{
          "title": "Event type",
          "type": "integer",
          "const": 7
        },
        {
          "$ref": "#/$defs/timestamp"
        }
      ]
    },
    "focusWindowEvent": {
      "type": "array",
      "title": "Focus window event",
      "description": "Focus enters window event",
      "prefixItems": [{
          "title": "Event type",
          "type": "integer",
          "const": 8
        },
        {
          "$ref": "#/$defs/timestamp"
        }
      ]
    },
    "wheelEvent": {
      "type": "array",
      "title": "Wheel event",
      "description": "Mouse wheel event",
      "prefixItems": [{
          "title": "Event type",
          "type": "integer",
          "const": 9
        },
        {
          "$ref": "#/$defs/timestamp"
        },
        {
          "title": "deltaX",
          "type": "number"
        },
        {
          "title": "deltaY",
          "type": "number"
        },
        {
          "title": "deltaZ",
          "type": "number"
        },
        {
          "title": "deltaMode",
          "type": "integer"
        }
      ]
    },
    "scrollEvent": {
      "type": "array",
      "title": "Scroll event",
      "description": "Mouse scroll event",
      "prefixItems": [{
          "title": "Event type",
          "type": "integer",
          "const": 106
        },
        {
          "$ref": "#/$defs/timestamp"
        },
        {
          "title": "scrollX",
          "type": "number"
        },
        {
          "title": "scrollY",
          "type": "number"
        }
      ]
    },
    "metadataEvent": {
      "type": "array",
      "title": "Metadata event",
      "description": "Metadata event sends information about the device",
      "prefixItems": [{
          "title": "Event type",
          "type": "integer",
          "const": 11
        },
        {
          "$ref": "#/$defs/timestamp"
        },
        {
          "type": "object",
          "properties": {
            "platform": {
              "type": "object",
              "title": "Info about the device",
              "properties": {
                "description": {
                  "type": "string",
                  "title": "The platform description."
                },
                "layout": {
                  "type": "string",
                  "title": "The name of the browser's layout engine."
                },
                "manufacturer": {
                  "type": ["string", "null"],
                  "title": "The name of the product's manufacturer."
                },
                "name": {
                  "type": "string",
                  "title": "The name of the browser/environment."
                },
                "prerelease": {
                  "type": ["string", "null"],
                  "title": "Alpha / beta indicator"
                },
                "product": {
                  "type": ["string", "null"],
                  "title": "The name of the product hosting the browser."
                },
                "ua": {
                  "type": "string",
                  "title": "The browser's user agent string"
                },
                "version": {
                  "type": "string",
                  "title": "The browser/environment version"
                },
                "os": {
                  "type": "object",
                  "title": "Info about the device OS",
                  "properties": {
                    "architecture": {
                      "type": "integer",
                      "title": "OS architecture"
                    },
                    "family": {
                      "type": "string",
                      "title": "OS family"
                    },
                    "version": {
                      "type": "string",
                      "title": "OS version"
                    }
                  }
                }
              }
            },
            "location": {
              "type": "object",
              "properties": {
                "current": {
                  "type": "string",
                  "title": "Current url"
                },
                "previous": {
                  "type": "string",
                  "title": "Previous url"
                }
              }
            },
            "custom": {
              "type": "object",
              "title": "A dictionary (key-value pairs) of custom metadata"
            },
            "screen": {
              "type": "object",
              "properties": {
                "availHeight": {
                  "type": "integer",
                  "title": "Height of the visitor's screen, in pixels, minus interface features"
                },
                "availWidth": {
                   "type": "integer",
                   "title": "Width of the visitor's screen, in pixels, minus interface features"
                },
                "availLeft": {
                  "type": "integer",
                  "title": "Left of the visitor's screen, in pixels, minus interface features"
                },
                "availTop": {
                  "type": "integer",
                  "title": "Top of the visitor's screen, in pixels, minus interface features"
                },
                "height": {
                  "type": "integer",
                  "title": "Height of the visitor's screen"
                },
                "width": {
                  "type": "integer",
                  "title": "Width of the visitor's screen"
                },
                "top": {
                  "type": "integer",
                  "title": "Top of the visitor's screen"
                },
                "left": {
                  "type": "integer",
                  "title": "Left of the visitor's screen"
                },
                "colorDepth": {
                  "type": "integer",
                  "title": "Color depth of the screen"
                },
                "pixelDepth": {
                  "type": "integer",
                  "title": "Pixel depth of the screen"
                },
                "devicePixelRatio": {
                  "type": "number",
                  "title": "Physical pixel / CSS pixel ratio"
                },
                "orientation": {
                  "type": "object",
                  "title": "Orientation of the screen",
                  "properties": {
                    "type": {
                      "type": "string"
                    },
                    "angle": {
                      "type": "integer"
                    }
                  }
                }
              }
            },
            "document": {
              "type": "object",
              "properties": {
                "scrollLeft": {
                  "type": "number",
                  "title": "Scroll left of the document element"
                },
                "scrollTop": {
                  "type": "number",
                  "title": "Scroll top of the document element"
                },
                "scrollHeight": {
                  "type": "number",
                  "title": "Height of the document element (including the content that is not visible on the screen)"
                },
                "scrollWidth": {
                  "type": "number",
                  "title": "Width of the document element (including the content that is not visible on the screen)"
                },
                "offsetHeight": {
                  "type": "number",
                  "title": "Height of the document element with borders and scrollbar"
                },
                "offsetWidth": {
                  "type": "number",
                  "title": "Width of the document element with borders and scrollbar"
                },
                "clientTop": {
                  "type": "number",
                  "title": "Width of the top border"
                },
                "clientLeft": {
                  "type": "number",
                  "title": "Width of the left border"
                },
                "clientHeight": {
                  "type": "number",
                  "title": "Height of the document element"
                },
                "clientWidth": {
                  "type": "number",
                  "title": "Width of the document element"
                }
              }
            }
          }
        }
      ]
    },
    "timestamp": {
      "type": "number",
      "title": "Timestamp",
      "description": "UTC timestamp in milliseconds"
    }
  }
}
```
