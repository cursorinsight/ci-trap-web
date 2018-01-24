// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

// eslint-disable-next-line no-global-assign
require = (function (modules, cache, entry) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof require === "function" && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof require === "function" && require;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }
      
      localRequire.resolve = resolve;

      var module = cache[name] = new newRequire.Module;

      modules[name][0].call(module.exports, localRequire, module, module.exports);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module() {
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  // Override the current require with this new one
  return newRequire;
})({7:[function(require,module,exports) {
/* global module */

var Transport = function(window) {
"use strict";
// ---------------------------------------------------------------------------

// @constant
var map  = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

// @constant
var head = "BB"; // v2 :)

// buffer
var buffer = "";

// Locals.
var
  encodeWrapper = window.encodeURIComponent,

  url = "/s",
  headers = {},
  counter = 1,
  sessionID,

  encodeValues = function(values, sizes) {
    var idx,
        len = values.length,
        bc = 0, // bit counter
        cv, // current value
        av = 0, // actual value
        size,
        results = "";

    for (idx = 0; idx < len; idx++) {
      cv = values[idx];
      size = sizes[idx];
      if (cv < 0) { cv = 0; }
      if (cv > ((2 << size) - 1)) { cv = ((2 << size) - 1); }
      if (av > 0) {
        av = av << size;
      }
      av |= cv & ((1 << size) - 1);
      bc += size;
      while (bc > 6) {
        bc -= 6;
        results += map[av >>> bc];
        av &= (1 << bc) - 1;
      }
    }

    results += map[av << (6 - bc)];

    return results;
  },

  encodeHeaders = function(headers) {
    var headerString = "";

    for (var key in headers) {
      if (headers.hasOwnProperty(key)) {
        headerString = headerString
          + encodeWrapper(key) + "="
          + encodeWrapper(headers[key]) + ",";
      }
    }

    return encodeValues([headerString.length], [12]) + headerString;
  };

/*
 * @private
 * Resets buffer.
 */
function reset() {
  buffer = "";
  return true;
}

/*
 * @private
 * Shifts available data.  That means resetting to its defaults and returning
 * already collected events.
 */
function shift() {
  var contents = buffer;
  reset();
  return contents;
}

/*
 * @private
 * Encodes raw bytes into stream format (length + URI encoded string
 * representation).
 */
function encodeRawBytes(bytes) {
  var encoded = encodeWrapper(bytes);
  return encodeValues([encoded.length], [12]) + encoded;
}

/**
 * Sends data to destination.
 */
this.send = function(sync, callback) {
  var
    req = new window.XMLHttpRequest(),
    onResponse = function() {
      if (callback){
        if ((req.readyState === 4) && (req.status === 200)) {
          callback(req);
        }
      }
    },
    onSuccess = function() {}, // TODO
    onFailure = function() {}; // TODO

  // TODO make it configurable (enable/disable) w//o
  headers["stream-id"] = (sessionID ? sessionID : "") + "." + (counter++);

  if ("withCredentials" in req) { // Is it a real XMLHttpRequest2 object
    req.open("POST", url, !sync);
    req.onreadystatechange = onResponse; // TODO XMLHttpRequest2 has onload and co...
    req.setRequestHeader("Content-type", "text/plain");
    // req.withCredentials = true;
  } else if (typeof window.XDomainRequest !== "undefined") { // XDomainRequest only exists in IE
    req = new window.XDomainRequest();
    req.onload = onSuccess;
    req.onerror = onFailure;
    req.contentType = "text/plain";
    req.open("POST", url);
  } else if (typeof window.ActiveXObject !== "undefined") { // Is it OK? :)
    req = new window.ActiveXObject("Microsoft.XMLHTTP");
    req.open("POST", url);
  } else {
    // TODO Firefox in test mode get to this branch
    req.open("POST", url, !sync);
    req.onload = onResponse;
    req.setRequestHeader("Content-type", "text/plain");
    //req = null;
    //throw new Error('CORS not supported'); // TODO
  }

  req.send(head + encodeHeaders(headers) + shift());

  return true;
};

/**
 * Sets destination URL.
 */
this.setUrl = function(u) {
  url = u;
};

/**
 * Sets request header k/v pair.
 */
this.setHeader = function(key, value) {
  headers[key] = value;
};

/**
 * Sets session ID for this session.
 */
this.setSessionID = function(s) {
  sessionID = s;
};

/**
 * Returns current buffer contents (without version magic and headers).
 */
this.buffer = function() {
  return buffer;
};

/**
 * Encodes and pushes values sampled by its given size into buffer.
 */
this.push = function(values, sizes) {
  buffer += encodeValues(values, sizes);
  return buffer;
};

/**
 * Encodes raw bytes into stream format (length + URI encoded string
 * representation).
 */
this.encodeRawBytes = encodeRawBytes;

/**
 * Appends raw (encoded) bytes to buffer.
 */
this.pushRawBytes = function(bytes) {
  buffer += encodeRawBytes(bytes);
  return buffer;
};

/**
 * Resets buffer.
 */
this.reset = reset;

// ---------------------------------------------------------------------------
};

module.exports = Transport;

},{}],8:[function(require,module,exports) {
/* global module */

var State = function(window, transport, idleTimeout) {
"use strict";
// ---------------------------------------------------------------------------

var
  idleHandler, idleTimer,
  epochTs, lastTs;

if (typeof idleTimeout === "number") {
  idleHandler = function() {
    transport.send();
    idleTimer = null;
  };
}

/*
 * Returns a stable time difference (between events, even if event does not
 * support event.timeStamp).
 *
 * Examples:
 *                  0 -- firefox window resize / scroll
 *          161262400 -- firefox mouse move
 *         1409096136 -- timestamp sec
 *         2000000000 -- timestamp sec boundary
 *      1409095770713 -- chrome all
 *      1409096838717 -- firefox (new Date()).getTime()
 *   1000000000000000 -- timestamp micro boundary
 *   1409096424364149 -- firefox custom event
 */
this.getDT = function(event, bits) {

  var
    round = Math.round,
    currentTs = event && typeof event.timeStamp === "number" && event.timeStamp || (new Date()).getTime(),
    dT;

  if (idleTimer) {
    window.clearTimeout(idleTimer);
    idleTimer = null;
  }

  if (currentTs > 1000000000000000) { // (microseconds) in Firefox, special events
    currentTs = round(currentTs / 1000);
  }

  if (currentTs < 2000000000) { // (milliseconds) it's Firefox; take care
    if (!epochTs) {
      epochTs = (new Date()).getTime() - currentTs; 
    }
    if (lastTs) {
      dT = (currentTs + epochTs) - lastTs;
    }
    lastTs = (currentTs + epochTs);
  } else {                      // (milliseconds) everything else
    if (lastTs) {
      dT = currentTs - lastTs;
    }
    lastTs = currentTs;
  }

  // var dT1 = dT;

  if (dT === undefined) {
    return 0;
  }

  if (typeof idleTimeout === "number") {
    idleTimer = window.setTimeout(idleHandler, idleTimeout);
  }

  if (bits) {
    var max = (1 << bits) - 1;
    dT = dT > max ? max : dT;
  }

  // TODO we should correct sync (when dT < 0)
  // if (dT < 0) { // we can correct sync
  //   epochTs = epochTs + dT;
  //   lastTs  = lastTs + dT;
  //   dT = 0;
  // }
  // console.log(dT1, dT, dT1 !== dT && "-----------------------------------------");

  return dT;
};

this.lastTs = function() {
  return lastTs;
};

this.start = function() {
  // noop
};

this.stop = function() {
  lastTs = null;
};

// ---------------------------------------------------------------------------
};

module.exports = State;

},{}],9:[function(require,module,exports) {
/* global module */

var StateHandler = function(window, document, element, state, buffer) {
"use strict";
// ---------------------------------------------------------------------------

var
  /*
   * State event name (constant).
   */
  eventName = "ct:state",

  /*
   * State event handler.
   */
  handler = function(event) {
    var
      dT = state.getDT(event, 20);

    buffer.push([15, dT, state.lastTs(),                      // 0b1111 <time-difference:20b> <current-time-stamp:42b>
                 state.mouseScreenX, state.mouseScreenY,      // <mouse-screen-x:18b> <mouse-screen-y:18b>
                 //state.cX, state.cY,                          // <mouse-client-x:18b> <mouse-client-y:18b>
                 state.pageScrollX, state.pageScrollY,        // <page-scroll-x(left):18b> <page-scroll-y(top):18b>
                 window.innerWidth, window.innerHeight,       // <inner-window-width:18b> <inner-window-height:18b>
                 window.outerWidth, window.outerHeight,       // <outer-window-width:18b> <outer-window-height:18b>
                 window.screenX || window.screenLeft,         // <window-position-left:18b>
                 window.screenY || window.screenTop,          // <window-position-top:18b>
                 window.screen.width, window.screen.height    // <screen-width:18b> <screen-height:18b>
                 ],
                [  4, 20, 42,
                  18, 18, // 18, 18,
                  18, 18, 18, 18,
                  18, 18, 18, 18,
                  18, 18]);
  },

  trigger = function() {
    var stateEvent = document.createEvent("CustomEvent");
    stateEvent.initEvent(eventName, true, false);
    element.dispatchEvent(stateEvent);
  };

this.trigger = trigger;

this.start = function(options) {
  element.addEventListener(eventName, handler, false);
  if (options.initialState === true) {
    trigger();
  }
};

this.stop = function() {
  element.removeEventListener(eventName, handler);
};

// ---------------------------------------------------------------------------
};

module.exports = StateHandler;

},{}],10:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = MarkerHandler;
function MarkerHandler() {
  constructor(window, document, element, state, buffer);

  var eventName = "ct:mark",
      defaultText = "marker",
      handler = function (event) {
    var dT = state.getDT(event, 20),
        text = event && event.text || defaultText;

    buffer.push([14, dT], [4, 20]);
    buffer.pushRawBytes(text);
  };

  this.trigger = function (text) {
    var markEvent = document.createEvent("CustomEvent");
    markEvent.initEvent(eventName, true, false);
    markEvent.text = text || "mark";
    element.dispatchEvent(markEvent);
  };

  this.start = function () {
    element.addEventListener(eventName, handler, false);
  };

  this.stop = function () {
    element.removeEventListener(eventName, handler);
  };
}
},{}],11:[function(require,module,exports) {
/* global module */

// TODO: http://www.jacklmoore.com/notes/mouse-position/

var MouseMoveHandler = function(element, state, buffer) {
"use strict";
// ---------------------------------------------------------------------------

var
  // abs = Math.abs,
  eventName = "mousemove",

  handler = function(event) {
    var
      dT = state.getDT(event, 20),
      sX = event.screenX,
      sY = event.screenY;

    // Saving for next check
    state.mouseScreenX = sX;
    state.mouseScreenY = sY;

    buffer.push([0, dT, sX, sY],
                [4, 20, 18, 18]);

    // Saving for markers -- temporarily disabled
    // state.cX = event.clientX;
    // state.cY = event.clientY;
    // buffer.push([0, dT, sX, sY, event.clientX, event.clientY],
    //             [4, 20, 18, 18,            18,            18]);

    return true;
  };

this.start = function() {

  // TODO: Something more accurate is needed.
  state.mouseScreenX = state.mouseScreenX || 0;
  state.mouseScreenY = state.mouseScreenY || 0;

  element.addEventListener(eventName, handler);
};

this.stop = function() {
  element.removeEventListener(eventName, handler);
};

// ---------------------------------------------------------------------------
};

module.exports = MouseMoveHandler;

},{}],12:[function(require,module,exports) {
/* global module */

var MouseButtonHandler = function(element, state, buffer) {
"use strict";
// ---------------------------------------------------------------------------

function button(event) {
  var bb = event.which ||
    function(b) {
      if (b === 4) { return 2; }
      else if (b === 2) { return 3; }
      else { return 1; }
    }(event.button);
  return bb;
}

var
  downEventName = "mousedown",
  upEventName = "mouseup",

  downHandler = function(event) {
    var dT = state.getDT(event, 20);
    buffer.push([2, dT, 1, button(event)], [4, 20, 1, 5]);
  },

  upHandler = function(event) {
    var dT = state.getDT(event, 20);
    buffer.push([2, dT, 0, button(event)], [4, 20, 1, 5]);
  };

this.start = function() {
  element.addEventListener(downEventName, downHandler);
  element.addEventListener(upEventName, upHandler);
};

this.stop = function() {
  element.removeEventListener(downEventName, downHandler);
  element.removeEventListener(upEventName, upHandler);
};

// ---------------------------------------------------------------------------
};

module.exports = MouseButtonHandler;

},{}],13:[function(require,module,exports) {
/* global module */

// TODO simplify/check this handler

var PageScrollHandler = function(element, state, buffer) {
"use strict";
// ---------------------------------------------------------------------------

var
  abs = Math.abs,
  eventName = "scroll",

  handler = function(event) {

    var
      pX, pY,
      dX, dY,
      signDX, signDY,
      absDX, absDY,

      dT = state.getDT(event, 20);

    // Scroll X/Y on current page
    if ("pageXOffset" in element && element.document) { // it's a window, or looks like a window
      var doc = element.document.documentElement;
      pX = (element.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
      pY = (element.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);
    } else { // fallback
      pX = event.pageX;
      pY = event.pageY;
    }

    dX     = pX - state.pX;
    signDX = dX < 0 ? 1 : 0;
    absDX  = abs(dX);
    dY     = pY - state.pY;
    signDY = dY < 0 ? 1 : 0;
    absDY  = abs(dY);

    state.pageScrollX = pX;
    state.pageScrollY = pY;

    buffer.push([4, dT, signDX, absDX, signDY, absDY],
                [4, 20,      1,    11,      1,    11]);

    return true;
  };

this.start = function() {

  // Scroll X/Y on current page
  if ("pageXOffset" in element && element.document) { // it's a window, or looks like a window
    var doc = element.document.documentElement;
    state.pageScrollX = (element.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
    state.pageScrollY = (element.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);
  } else { // fallback
    state.pageScrollX = 0;
    state.pageScrollY = 0;
  }

  element.addEventListener(eventName, handler, false);
};

this.stop = function() {
  element.removeEventListener(eventName, handler, false);
};

// ---------------------------------------------------------------------------
};

module.exports = PageScrollHandler;

},{}],14:[function(require,module,exports) {
/* global module */

var WindowSizeHandler = function(window, state, buffer) {
"use strict";
// ---------------------------------------------------------------------------

var
  delay = 1000 / 15, // 15fps
  timeout,

  handler = function(event) {
    var
      w  = window.innerWidth,
      h  = window.innerHeight,
      dT = state.getDT(event, 20);

    // type = 0b1000
    buffer.push([8, dT,  w,  h],
                [4, 20, 15, 15]);
  },

  throttler = function(event) {
    if (timeout) {
      window.clearTimeout(timeout);
    }

    timeout = window.setTimeout(function() {
      timeout = null;
      handler(event);
    }, delay);
  };

this.start = function() {
  state.wW = window.innerWidth;
  state.wH = window.innerHeight;
  window.addEventListener("resize", throttler, false);
};

this.stop = function() {
  window.removeEventListener("resize", throttler, false);
};

// ---------------------------------------------------------------------------
};

module.exports = WindowSizeHandler;

},{}],15:[function(require,module,exports) {
/* global module */

var WindowPositionHandler = function(window, document, state, buffer) {
"use strict";
// ---------------------------------------------------------------------------

var
  eventName = "positionchanged",
  longDelay = 1000 / 2, // 2fps
  shortDelay = 1000 / 15, // 15fps
  throttleBase = 15, // it's a "constant"
  throttleCount = throttleBase,
  timeout,

  windowPositionX = function() {
    return window.screenX || window.screenLeft || 0;
  },

  windowPositionY = function() {
    return window.screenY || window.screenTop || 0;
  },

  handler = function(event) {
    var dT = state.getDT(null, 20);

    state.windowPositionX = event.x;
    state.windowPositionY = event.y;

    // type = 0b1001
    buffer.push([9, dT, event.x, event.y],
                [4, 20,      15,      15]);
  },

  poller = function() {
    var
      x = windowPositionX(),
      y = windowPositionY();

    if (state.windowPositionX !== x || state.windowPositionY !== y) {
      var event = document.createEvent("CustomEvent");
      event.initEvent(eventName, true, false);
      event.x = x;
      event.y = y;
      window.dispatchEvent(event);

      throttleCount = throttleBase;
    }

    if (throttleCount > 0) {
      throttleCount--;
      timeout = window.setTimeout(poller, shortDelay);
    } else {
      timeout = window.setTimeout(poller, longDelay);
    }
  },

  startPoller = function() {
    window.setTimeout(poller, longDelay);
  },

  stopPoller = function() {
    if (timeout) {
      window.clearTimeout(timeout);
    }
  };

this.start = function() {
  state.windowPositionX = windowPositionX();
  state.windowPositionY = windowPositionY();
  window.addEventListener(eventName, handler, false);
  startPoller();
};

this.stop = function() {
  stopPoller();
  window.removeEventListener(eventName, handler, false);
};

// ---------------------------------------------------------------------------
};

module.exports = WindowPositionHandler;

},{}],16:[function(require,module,exports) {
/* global module */

var WindowUnloadHandler = function(window, state, buffer) {
"use strict";
// ---------------------------------------------------------------------------

var
  eventName = "beforeunload",

  handler = function(event) {
    var dT = state.getDT(event, 20);

    // 0b1001
    buffer.push([12, dT],
                [ 4, 20]);
  };

this.start = function() {
  window.addEventListener(eventName, handler, false);
};

this.stop = function() {
  window.removeEventListener(eventName, handler, false);
};

// ---------------------------------------------------------------------------
};

module.exports = WindowUnloadHandler;

},{}],17:[function(require,module,exports) {
/* global module */

var VisibilityChangeHandler = function(window, state, buffer) {
"use strict";
// ---------------------------------------------------------------------------

var
  stateKey,
  eventKey,

  keys = {
    hidden: "visibilitychange",
    webkitHidden: "webkitvisibilitychange",
    mozHidden: "mozvisibilitychange",
    msHidden: "msvisibilitychange"
  };

for (stateKey in keys) {
  if (stateKey in window.document) {
    eventKey = keys[stateKey];
    break;
  }
}

var
  handler = function(event) {
    var dT = state.getDT(event, 20);

    if (window.document[stateKey]) { // idle/hidden, 0b1011
      buffer.push([11, dT],
                  [ 4, 20]);
    } else { // focused/visible, 0b1010
      buffer.push([10, dT],
                  [ 4, 20]);
    }
  };

this.start = function() {
  window.addEventListener(eventKey, handler, false);
};

this.stop = function() {
  window.removeEventListener(eventKey, handler, false);
};

// ---------------------------------------------------------------------------
};

module.exports = VisibilityChangeHandler;

},{}],18:[function(require,module,exports) {
/* global module */

// TODO: save touchScreenX/Y values into state
// TODO: simplify / group start/end/move handlers, they are nearly identical

var TouchHandler = function(element, state, buffer) {
"use strict";
// ---------------------------------------------------------------------------

var
  startEventName = "touchstart",
  endEventName = "touchend",
  moveEventName = "touchmove",

  touchIdToId = [],

  // finds an existing (or free) id for given touchId, starting from 0.
  resolveId = function(touchId) {
    var
      firstFree,
      length = touchIdToId.length,
      i = 0;
    for(; i < length; i++) {
      if (touchIdToId[i] === touchId) { return i; }
      if (touchIdToId[i] === undefined) { firstFree = firstFree || i; }
    }
    if (typeof firstFree === "number") {
      touchIdToId[firstFree] = touchId;
      return firstFree;
    } else {
      touchIdToId.push(touchId);
      return length;
    }
  },

  // removes touchId from list.
  removeId = function(touchId) {
    var length = touchIdToId.length, i = 0;
    for(; i < length; i++) {
      if (touchIdToId[i] === touchId) { touchIdToId[i] = undefined; }
    }
    i--;
    for(; i >= 0; i--) {
      if (touchIdToId[i] === undefined) {
        touchIdToId.pop();
      } else {
        break;
      }
    }
  },

  startHandler = function(event) {
    var
      dT = state.getDT(event, 20),
      changedTouches = event.changedTouches,
      length = changedTouches.length,
      i = 0;

    for(; i < length; i++) {
      var
        ev = changedTouches[i],
        id = resolveId(ev.identifier);
      buffer.push([3, dT, 1, id, ev.screenX, ev.screenY],
                  [4, 20, 1,  5,         18,         18]);
      dT = 0; // next
    }

    return true;
  },

  endHandler = function(event) {
    var
      dT = state.getDT(event, 20),
      changedTouches = event.changedTouches,
      length = changedTouches.length,
      i = 0;

    for(; i < length; i++) {
      var
        ev = changedTouches[i],
        id = resolveId(ev.identifier);
      buffer.push([3, dT, 0, id, ev.screenX, ev.screenY],
                  [4, 20, 1,  5,         18,         18]);

      removeId(ev.identifier);

      dT = 0; // next
    }

    return true;
  },

  moveHandler = function(event) {
    var
      dT = state.getDT(event, 20),
      changedTouches = event.changedTouches,
      length = changedTouches.length,
      i = 0;

    for(; i < length; i++) {
      var
        ev = changedTouches[i],
        id = resolveId(ev.identifier);
      buffer.push([1, dT, 0, id, ev.screenX, ev.screenY],
                  [4, 20, 1,  5,         18,         18]);
      dT = 0; // next
    }

    return true;
  };

this.start = function() {
  element.addEventListener(startEventName, startHandler);
  element.addEventListener(moveEventName, moveHandler);
  element.addEventListener(endEventName, endHandler);
};

this.stop = function() {
  element.removeEventListener(startEventName, startHandler);
  element.removeEventListener(moveEventName, moveHandler);
  element.removeEventListener(endEventName, endHandler);
};

// ---------------------------------------------------------------------------
};

module.exports = TouchHandler;

},{}],5:[function(require,module,exports) {
/*! ci-trap v0.2.0 - MIT license */
/* global module require window */

/*
 * Motion event (mouse movement) catcher for browsers emitting data compatible
 * with Cursor Insight's motion analyzer engine. (touch, gyro, etc. is WIP)
 *
 * Copyright (c) 2012--2014, GOLDA Bence <gbence@algernon.hu>
 *                     2014, GOLDA Bence <bence@cursorinsight.com>
 *                     2014, TÖRTELI Olivér <oliver@cursorinsight.com>
 *
 * # Data format (in ~BNF) ##########################################
 *
 *    <data> ::= <version> <headers> <events>
 * <headers> ::= <header-size:12b> <url-encoded-string:<header-size in bytes>>
 *  <events> ::= <event> <events> | EOS
 *   <event> ::= <mouse-move> | <mouse-button>
 *             | <touch-move> | <touch-change>
 *             | <scroll-change>
 *             | <mouse-wheel-x> | <mouse-wheel-y>
 *             | <window-size-change> | <window-position-change>
 *             | <visibility-change> | <unload>
 *             | <marker> | <state>
 *
 * // this is (and will be) always a constant and a version id
 * <version>        ::= "B" <version-letter>
 * <version-letter> ::= "A" | "B" | "C" | "D" ...
 *
 * // sum: 60b
 * <mouse-move> ::= 0b0000 <time-difference:20b>
 *                  <mouse-screen-x:18b> <mouse-screen-y:18b>
 *
 * <touch-move> ::= 0b0001 <time-difference:20b>
 *                  <empty:1b> <touch-id:5b>
 *                  <touch-screen-x:18b> <touch-screen-y:18b>
 *
 * TODO: return only the differences and put "markers" (as full frames in
 * video) into the stream
 *
 * // sum: 66b
 * <mouse-button> ::= 0b0010 <time-difference:20b>
 *                    <button-state:1b> <button-definition:5b> // button-state == 1 for "down", == 0 for "up"
 *                    // <mouse-screen-x:18b> <mouse-screen-y:18b>
 *
 * <touch-change> ::= 0b0011 <time-difference:20b>
 *                    <touch-state:1b> <touch-id:5b> // touch-state == 1 for "down"/"start", == 0 for "up"/"end"
 *                    <touch-screen-x:18b> <touch-screen-y:18b>
 *
 * // sum: 48b
 * <scroll-change> ::= 0b0100 <time-difference:20b>
 *                     <sign-of-dx:1b> <abs-dx:11b>
 *                     <sign-of-dy:1b> <abs-dy:11b>
 *
 * // sum: 36b
 * <mouse-wheel-x> ::= 0b0110 <time-difference:20b>
 *                     <sign-of-d:1b> <abs-d:11b>
 *
 * // sum: 36b
 * <mouse-wheel-y> ::= 0b0111 <time-difference:20b>
 *                     <sign-of-d:1b> <abs-d:11b>
 *
 * // sum: 54b
 * <window-size-change> ::= 0b1000 <time-difference:20b>
 *                          <inner-window-width:15b> <inner-window-height:15b>
 *
 * // sum: 54b
 * <window-position-change> ::= 0b1001 <time-difference:20b>
 *                              <window-position-left:15b> <window-position-top:15b>
 *
 * // sum: 24b
 * <visibility-change> ::= 0b1010 <time-difference:20b> // (visible/focused)
 * <visibility-change> ::= 0b1011 <time-difference:20b> // (hidden/idle)
 *
 * // sum: 24b
 * <unload> ::= 0b1100 <time-difference:20b>
 *
 * // sum: variable
 * <marker> ::= 0b1110 <time-difference:20b>
 *              <size:12b> <url-encoded-string:<size in bytes>>
 *
 * // sum: 4+20+42+(12*18) = 282b
 * <state> ::= 0b1111 <time-difference:20b>
 *             <current-time-stamp:42b>
 *             <mouse-screen-x:18b> <mouse-screen-y:18b>
 *             // <mouse-client-x:18b> <mouse-client-y:18b> // temporarily disabled
 *             <page-scroll-x(left):18b> <page-scroll-top-y(top):18b>
 *             <inner-window-width:18b> <inner-window-height:18b>
 *             <outer-window-width:18b> <outer-window-height:18b>
 *             <window-position-left:18b> <window-position-top:18b>
 *             <screen-width:18b> <screen-height:18b>
 *
 * JsDoc keyword:
 * https://code.google.com/p/jsdoc-toolkit/wiki/TagReference
 *
 * @link ClassName#CITrap
 */

(function(/* global */){function moduleDefinition(/*wheelShim*/) { // dependency1, dependency2...
"use strict";
// ---------------------------------------------------------------------------

/**
 * @constructor CITrap
 * @param {String} element Html element which will be watched
 * @return {Function} Return CITrap, it will be the module
 */
function CITrap(element, idleTimeout) {

  var
    windowAlias = window,
    documentAlias = window.document,
    undefinedAlias;

  // Set up defaults.
  if (element === undefinedAlias) {
    element = documentAlias;
  }

  var

    windowSupport = (element === windowAlias || element === documentAlias),
    touchSupport = "ontouchstart" in windowAlias ||    // works on most browsers
                   "onmsgesturechange" in windowAlias, // works on ie10

    // master loop
    running = false,

    // Buffer + transport
    Transport = require("./transport.js"),
    transport = new Transport(windowAlias),

    // State
    State = require("./state.js"),
    state = new State(windowAlias, transport, idleTimeout),

    // Handlers
    handlers = new Array(state),

    StateHandler = require("./stateHandler.js"),
    MarkerHandler = require("./markerHandler.js"),
    MouseMoveHandler = require("./mouseMoveHandler.js"),
    MouseButtonHandler = require("./mouseButtonHandler.js"),
    PageScrollHandler = require("./pageScrollHandler.js"),
    //MouseWheelHandler = require("./mouseWheelHandler.js");

    markerHandler = new MarkerHandler(windowAlias, documentAlias, element, state, transport);

  handlers.push(new StateHandler(windowAlias, documentAlias, element, state, transport));
  handlers.push(markerHandler);
  handlers.push(new MouseMoveHandler(element, state, transport));
  handlers.push(new MouseButtonHandler(element, state, transport));

  // IE 6, 7, 8 does not support scroll event on document
  // http://www.quirksmode.org/dom/events/scroll.html
  handlers.push(new PageScrollHandler(element === documentAlias ? windowAlias : element, state, transport));

  // handlers.push(new MouseWheelHandler(element, state, transport));

  if (windowSupport) {
    var
      WindowSizeHandler = require("./windowSizeHandler.js"),
      WindowPositionHandler = require("./windowPositionHandler.js"),
      WindowUnloadHandler = require("./windowUnloadHandler.js"),
      VisibilityChangeHandler = require("./visibilityChangeHandler.js");
    handlers.push(new WindowSizeHandler(windowAlias, state, transport));
    handlers.push(new WindowPositionHandler(windowAlias, documentAlias, state, transport));
    handlers.push(new WindowUnloadHandler(windowAlias, state, transport));
    handlers.push(new VisibilityChangeHandler(windowAlias, state, transport));
  }

  if (touchSupport) {
    var TouchHandler = require("./touchHandler.js");
    handlers.push(new TouchHandler(element, state, transport));
  }

  /*
   * Public methods
   */
  return {

    /**
     *  Starts event processing.
     */
    start: function(options) {
      if (running) {
        return;
      }
      options = options || {};
      var length = handlers.length, i = 0;
      for (;i < length; i++) {
        if((handlers[i] !== undefinedAlias) && (typeof handlers[i].start === "function")) {
          handlers[i].start(options);
        }
      }
      running = true;
    },

    /**
     *  Stops event processing.
     */
    stop: function() {
      if (!running) {
        return;
      }
      var length = handlers.length, i = 0;
      for (;i < length; i++) {
        if((handlers[i] !== undefinedAlias) && (typeof handlers[i].stop === "function")) {
          handlers[i].stop();
        }
      }
      running = false;
    },

    buffer: function() {
      return transport.buffer();
    },

    // TODO make this "readonly"
    element: element,

    send: function() {
      return transport.send.apply(this, arguments);
    },

    setHeader: function() {
      return transport.setHeader.apply(this, arguments);
    },

    setUrl: function() {
      return transport.setUrl.apply(this, arguments);
    },

    setSessionID: function() {
      return transport.setSessionID.apply(this, arguments);
    },

    mark: function(text) {
      if (markerHandler) {
        markerHandler.trigger(text);
      }
    }

  };
}

/**
 * Expose CITrap
 */

return CITrap;

// ---------------------------------------------------------------------------
}

module.exports = moduleDefinition(/*require("../vendor/mdn-wheel.js")*/);

}(this));

},{"./transport.js":7,"./state.js":8,"./stateHandler.js":9,"./markerHandler.js":10,"./mouseMoveHandler.js":11,"./mouseButtonHandler.js":12,"./pageScrollHandler.js":13,"./windowSizeHandler.js":14,"./windowPositionHandler.js":15,"./windowUnloadHandler.js":16,"./visibilityChangeHandler.js":17,"./touchHandler.js":18}],3:[function(require,module,exports) {
/* global window document require */

(function(global, window, document, require) {
"use strict";
// ---------------------------------------------------------------------------

// Mini-apps demonstrating CITrap's functions.

var CITrap = require("../../src/ci-trap");

// Example 0 -- export CITrap to play around.
window.CITrap = CITrap;
// end of Example 0

// Example 1 -- start-stop-send buttons
var ciTrap = new CITrap();
window.ciTrap = ciTrap;

var ex1StartButton        = document.getElementById("ex1-start"),
  ex1StopButton           = document.getElementById("ex1-stop"),
  ex1ShowBufferButton     = document.getElementById("ex1-show-buffer"),
  ex1MarkButton           = document.getElementById("ex1-mark"),
  ex1DebugButton          = document.getElementById("ex1-debug"),
  ex1SendButton           = document.getElementById("ex1-send"),

  stateSpan               = document.getElementById("window-state");

ex1StartButton.addEventListener("click", function(event) {
  if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
  ciTrap.start();
  // Remove this when DOM-events are available in CITrap
  stateSpan.innerHTML = "processing";
});

ex1StopButton.addEventListener("click", function(event) {
  if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
  ciTrap.stop();
  // Remove this when DOM-events are available in CITrap
  stateSpan.innerHTML = "stopped";
});

ex1ShowBufferButton.addEventListener("click", function(event) {
  if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
  var pre = document.getElementById("window-buffer");
  pre.innerHTML = ciTrap.buffer();
});

ex1MarkButton.addEventListener("click", function(event) {
  if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
  var markEvent = new window.Event("ct:mark"),
    markInput = document.getElementById("ex1-mark-input"),
    text = markInput.value;
  if (text) { markEvent.text = text; }
  if (ciTrap.element) {
    ciTrap.element.dispatchEvent(markEvent);
  }
  stateSpan.innerHTML = "sent";
});

ex1DebugButton.addEventListener("click", function(event) {
  if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
  var debugEvent = new window.Event("ct:debug");
  if (ciTrap.element) {
    ciTrap.element.dispatchEvent(debugEvent);
  }
  stateSpan.innerHTML = "sent";
});

ex1SendButton.addEventListener("click", function(event) {
  if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
  ciTrap.send(false, function() {stateSpan.innerHTML = "sent";});
});

// end of Example 1

// ---------------------------------------------------------------------------
})(this, window, document, require);

},{"../../src/ci-trap":5}],0:[function(require,module,exports) {
var global = (1, eval)('this');
var OldModule = module.bundle.Module;
function Module() {
  OldModule.call(this);
  this.hot = {
    accept: function (fn) {
      this._acceptCallback = fn || function () {};
    },
    dispose: function (fn) {
      this._disposeCallback = fn;
    }
  };
}

module.bundle.Module = Module;

if (!module.bundle.parent && typeof WebSocket !== 'undefined') {
  var ws = new WebSocket('ws://' + window.location.hostname + ':52323/');
  ws.onmessage = function(event) {
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      data.assets.forEach(function (asset) {
        hmrApply(global.require, asset);
      });

      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          hmrAccept(global.require, asset.id);
        }
      });
    }

    if (data.type === 'reload') {
      ws.close();
      ws.onclose = function () {
        window.location.reload();
      }
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + 'data.error.stack');
    }
  };
}

function getParents(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];
      if (dep === id || (Array.isArray(dep) && dep[dep.length - 1] === id)) {
        parents.push(+k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAccept(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAccept(bundle.parent, id);
  }

  var cached = bundle.cache[id];
  if (cached && cached.hot._disposeCallback) {
    cached.hot._disposeCallback();
  }

  delete bundle.cache[id];
  bundle(id);

  cached = bundle.cache[id];
  if (cached && cached.hot && cached.hot._acceptCallback) {
    cached.hot._acceptCallback();
    return true;
  }

  return getParents(global.require, id).some(function (id) {
    return hmrAccept(global.require, id)
  });
}
},{}]},{},[0,3])