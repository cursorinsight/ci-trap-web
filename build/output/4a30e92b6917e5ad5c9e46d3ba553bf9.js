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
})({6:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var idleTimer, epochTs, _lastTs;

var State = function () {
  function State(window, transport, idleTimeout) {
    _classCallCheck(this, State);

    this.window = window, this.transport = transport, this.idleTimeout = idleTimeout;

    this.getDT = this.getDT.bind(this);
    this.idleHandler = this.idleHandler.bind(this);

    if (idleTimeout !== 0) {
      this.idleHandler();
    }
  }

  _createClass(State, [{
    key: "idleHandler",
    value: function idleHandler() {
      this.transport.send();
      idleTimer = null;
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

  }, {
    key: "getDT",
    value: function getDT(event, bits) {

      var round = Math.round,
          currentTs = event && typeof event.timeStamp === "number" && event.timeStamp || new Date().getTime(),
          dT;

      if (idleTimer) {
        this.window.clearTimeout(idleTimer);
        idleTimer = null;
      }

      if (currentTs > 1000000000000000) {
        // (microseconds) in Firefox, special events
        currentTs = round(currentTs / 1000);
      }

      if (currentTs < 2000000000) {
        // (milliseconds) it's Firefox; take care
        if (!epochTs) {
          epochTs = new Date().getTime() - currentTs;
        }
        if (_lastTs) {
          dT = currentTs + epochTs - _lastTs;
        }
        _lastTs = currentTs + epochTs;
      } else {
        // (milliseconds) everything else
        if (_lastTs) {
          dT = currentTs - _lastTs;
        }
        _lastTs = currentTs;
      }

      // var dT1 = dT;

      if (dT === undefined) {
        return 0;
      }

      if (this.idleTimeout !== 0) {
        idleTimer = this.window.setTimeout(this.idleHandler, this.idleTimeout);
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
    }
  }, {
    key: "lastTs",
    value: function lastTs() {
      return _lastTs;
    }
  }, {
    key: "start",
    value: function start() {
      // noop
    }
  }, {
    key: "stop",
    value: function stop() {
      _lastTs = null;
    }
  }]);

  return State;
}();

;

exports.default = State;
},{}],7:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var eventName = "ct:state";

var StateHandler = function () {
  function StateHandler(window, document, element, state, buffer) {
    _classCallCheck(this, StateHandler);

    this.window = window, this.document = document, this.element = element, this.state = state, this.buffer = buffer;

    this.handler = this.handler.bind(this);
  }
  // ---------------------------------------------------------------------------


  /*
   * State event handler.
   */


  _createClass(StateHandler, [{
    key: "handler",
    value: function handler(event) {
      var dT = this.state.getDT(event, 20);

      this.buffer.push([15, dT, this.state.lastTs(), // 0b1111 <time-difference:20b> <current-time-stamp:42b>
      this.state.mouseScreenX, this.state.mouseScreenY, // <mouse-screen-x:18b> <mouse-screen-y:18b>
      //state.cX, state.cY,                          // <mouse-client-x:18b> <mouse-client-y:18b>
      this.state.pageScrollX, this.state.pageScrollY, // <page-scroll-x(left):18b> <page-scroll-y(top):18b>
      this.window.innerWidth, this.window.innerHeight, // <inner-window-width:18b> <inner-window-height:18b>
      this.window.outerWidth, this.window.outerHeight, // <outer-window-width:18b> <outer-window-height:18b>
      this.window.screenX || this.window.screenLeft, // <window-position-left:18b>
      this.window.screenY || this.window.screenTop, // <window-position-top:18b>
      this.window.screen.width, this.window.screen.height // <screen-width:18b> <screen-height:18b>
      ], [4, 20, 42, 18, 18, // 18, 18,
      18, 18, 18, 18, 18, 18, 18, 18, 18, 18]);
    }
  }, {
    key: "trigger",
    value: function trigger() {
      var stateEvent = this.document.createEvent("CustomEvent");
      stateEvent.initEvent(eventName, true, false);
      this.element.dispatchEvent(stateEvent);
    }
  }, {
    key: "start",
    value: function start(options) {
      this.element.addEventListener(eventName, this.handler, false);
      if (options.initialState === true) {
        trigger();
      }
    }
  }, {
    key: "stop",
    value: function stop() {
      this.element.removeEventListener(eventName, this.handler);
    }
  }]);

  return StateHandler;
}();

;

exports.default = StateHandler;
},{}],8:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// TODO: save touchScreenX/Y values into state
// TODO: simplify / group start/end/move handlers, they are nearly identical
var startEventName = "touchstart",
    endEventName = "touchend",
    moveEventName = "touchmove",
    touchIdToId = [];

var TouchHandler = function () {
  function TouchHandler(element, state, buffer) {
    _classCallCheck(this, TouchHandler);

    this.element = element, this.state = state, this.buffer = buffer;

    this.startHandler = this.startHandler.bind(this);
    this.moveHandler = this.moveHandler.bind(this);
    this.endHandler = this.endHandler.bind(this);
  }
  // ---------------------------------------------------------------------------


  // finds an existing (or free) id for given touchId, starting from 0.


  _createClass(TouchHandler, [{
    key: "resolveId",
    value: function resolveId(touchId) {
      var firstFree,
          length = touchIdToId.length,
          i = 0;
      for (; i < length; i++) {
        if (touchIdToId[i] === touchId) {
          return i;
        }
        if (touchIdToId[i] === undefined) {
          firstFree = firstFree || i;
        }
      }
      if (typeof firstFree === "number") {
        touchIdToId[firstFree] = touchId;
        return firstFree;
      } else {
        touchIdToId.push(touchId);
        return length;
      }
    }
  }, {
    key: "removeId",


    // removes touchId from list.
    value: function removeId(touchId) {
      var length = touchIdToId.length,
          i = 0;
      for (; i < length; i++) {
        if (touchIdToId[i] === touchId) {
          touchIdToId[i] = undefined;
        }
      }
      i--;
      for (; i >= 0; i--) {
        if (touchIdToId[i] === undefined) {
          touchIdToId.pop();
        } else {
          break;
        }
      }
    }
  }, {
    key: "startHandler",
    value: function startHandler(event) {
      var dT = this.state.getDT(event, 20),
          changedTouches = event.changedTouches,
          length = changedTouches.length,
          i = 0;

      for (; i < length; i++) {
        var ev = changedTouches[i],
            id = resolveId(ev.identifier);
        this.buffer.push([3, dT, 1, id, ev.screenX, ev.screenY], [4, 20, 1, 5, 18, 18]);
        dT = 0; // next
      }

      return true;
    }
  }, {
    key: "endHandler",
    value: function endHandler(event) {
      var dT = this.state.getDT(event, 20),
          changedTouches = event.changedTouches,
          length = changedTouches.length,
          i = 0;

      for (; i < length; i++) {
        var ev = changedTouches[i],
            id = resolveId(ev.identifier);
        this.buffer.push([3, dT, 0, id, ev.screenX, ev.screenY], [4, 20, 1, 5, 18, 18]);

        removeId(ev.identifier);

        dT = 0; // next
      }

      return true;
    }
  }, {
    key: "moveHandler",
    value: function moveHandler(event) {
      var dT = this.state.getDT(event, 20),
          changedTouches = event.changedTouches,
          length = changedTouches.length,
          i = 0;

      for (; i < length; i++) {
        var ev = changedTouches[i],
            id = resolveId(ev.identifier);
        this.buffer.push([1, dT, 0, id, ev.screenX, ev.screenY], [4, 20, 1, 5, 18, 18]);
        dT = 0; // next
      }

      return true;
    }
  }, {
    key: "start",
    value: function start() {
      this.element.addEventListener(startEventName, this.startHandler);
      this.element.addEventListener(moveEventName, this.moveHandler);
      this.element.addEventListener(endEventName, this.endHandler);
    }
  }, {
    key: "stop",
    value: function stop() {
      this.element.removeEventListener(startEventName, this.startHandler);
      this.element.removeEventListener(moveEventName, this.moveHandler);
      this.element.removeEventListener(endEventName, this.endHandler);
    }
  }]);

  return TouchHandler;
}();

;

exports.default = TouchHandler;
},{}],9:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var eventName = "ct:mark",
    defaultText = "marker";

var MarkerHandler = function () {
  function MarkerHandler(window, document, element, state, buffer) {
    _classCallCheck(this, MarkerHandler);

    this.window = window, this.document = document, this.element = element, this.state = state, this.buffer = buffer;

    this.handler = this.handler.bind(this);
  }
  // ---------------------------------------------------------------------------

  /*
   * Marker event name (constant).
   */

  _createClass(MarkerHandler, [{
    key: "handler",
    value: function handler(event) {
      var dT = this.state.getDT(event, 20),
          text = event && event.text || defaultText;

      this.buffer.push([14, dT], [4, 20]);
      this.buffer.pushRawBytes(text);
    }
  }, {
    key: "trigger",
    value: function trigger(text) {
      var markEvent = this.document.createEvent("CustomEvent");
      markEvent.initEvent(eventName, true, false);
      markEvent.text = text || "mark";
      this.element.dispatchEvent(markEvent);
    }
  }, {
    key: "start",
    value: function start() {
      this.element.addEventListener(eventName, this.handler, false);
    }
  }, {
    key: "stop",
    value: function stop() {
      this.element.removeEventListener(eventName, this.handler);
    }
  }]);

  return MarkerHandler;
}();

exports.default = MarkerHandler;
},{}],10:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var
// abs = Math.abs,
eventName = "mousemove";

// TODO: http://www.jacklmoore.com/notes/mouse-position/

var MouseMoveHandler = function () {
  function MouseMoveHandler(element, state, buffer) {
    _classCallCheck(this, MouseMoveHandler);

    this.element = element, this.state = state, this.buffer = buffer;

    this.handler = this.handler.bind(this);
  }

  _createClass(MouseMoveHandler, [{
    key: "handler",
    value: function handler(event) {
      var dT = this.state.getDT(event, 20),
          sX = event.screenX,
          sY = event.screenY;

      // Saving for next check
      this.state.mouseScreenX = sX;
      this.state.mouseScreenY = sY;

      this.buffer.push([0, dT, sX, sY], [4, 20, 18, 18]);

      // Saving for markers -- temporarily disabled
      // state.cX = event.clientX;
      // state.cY = event.clientY;
      // buffer.push([0, dT, sX, sY, event.clientX, event.clientY],
      //             [4, 20, 18, 18,            18,            18]);

      return true;
    }
  }, {
    key: "start",
    value: function start() {

      // TODO: Something more accurate is needed.
      this.state.mouseScreenX = this.state.mouseScreenX || 0;
      this.state.mouseScreenY = this.state.mouseScreenY || 0;

      this.element.addEventListener(eventName, this.handler);
    }
  }, {
    key: "stop",
    value: function stop() {
      this.element.removeEventListener(eventName, this.handler);
    }
  }]);

  return MouseMoveHandler;
}();

;

exports.default = MouseMoveHandler;
},{}],20:[function(require,module,exports) {

},{}],11:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _fs = require("fs");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var downEventName = "mousedown",
    upEventName = "mouseup";

var MouseButtonHandler = function () {
  function MouseButtonHandler(element, state, buffer) {
    _classCallCheck(this, MouseButtonHandler);

    this.element = element, this.state = state, this.buffer = buffer;

    this.downHandler = this.downHandler.bind(this);
    this.upHandler = this.upHandler.bind(this);
  }

  // ---------------------------------------------------------------------------

  _createClass(MouseButtonHandler, [{
    key: "button",
    value: function button(event) {
      var bb = event.which || function (b) {
        if (b === 4) {
          return 2;
        } else if (b === 2) {
          return 3;
        } else {
          return 1;
        }
      }(event.button);
      return bb;
    }
  }, {
    key: "downHandler",
    value: function downHandler(event) {
      var dT = this.state.getDT(event, 20);
      this.buffer.push([2, dT, 1, this.button(event)], [4, 20, 1, 5]);
    }
  }, {
    key: "upHandler",
    value: function upHandler(event) {
      var dT = this.state.getDT(event, 20);
      this.buffer.push([2, dT, 0, this.button(event)], [4, 20, 1, 5]);
    }
  }, {
    key: "start",
    value: function start() {
      this.element.addEventListener(downEventName, this.downHandler);
      this.element.addEventListener(upEventName, this.upHandler);
    }
  }, {
    key: "stop",
    value: function stop() {
      this.element.removeEventListener(downEventName, this.downHandler);
      this.element.removeEventListener(upEventName, this.upHandler);
    }
  }]);

  return MouseButtonHandler;
}();

exports.default = MouseButtonHandler;
},{"fs":20}],12:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var abs = Math.abs,
    eventName = "scroll";

// TODO simplify/check this handler

var PageScrollHandler = function () {
  function PageScrollHandler(element, state, buffer) {
    _classCallCheck(this, PageScrollHandler);

    this.element = element, this.state = state, this.buffer = buffer;

    this.handler = this.handler.bind(this);
  }
  // ---------------------------------------------------------------------------

  _createClass(PageScrollHandler, [{
    key: "handler",
    value: function handler(event) {

      var pX,
          pY,
          dX,
          dY,
          signDX,
          signDY,
          absDX,
          absDY,
          dT = this.state.getDT(event, 20);

      // Scroll X/Y on current page
      if ("pageXOffset" in this.element && this.element.document) {
        // it's a window, or looks like a window
        var doc = this.element.document.documentElement;
        pX = (this.element.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
        pY = (this.element.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);
      } else {
        // fallback
        pX = event.pageX;
        pY = event.pageY;
      }

      dX = pX - this.state.pX;
      signDX = dX < 0 ? 1 : 0;
      absDX = abs(dX);
      dY = pY - this.state.pY;
      signDY = dY < 0 ? 1 : 0;
      absDY = abs(dY);

      this.state.pageScrollX = pX;
      this.state.pageScrollY = pY;

      this.buffer.push([4, dT, signDX, absDX, signDY, absDY], [4, 20, 1, 11, 1, 11]);

      return true;
    }
  }, {
    key: "start",
    value: function start() {

      // Scroll X/Y on current page
      if ("pageXOffset" in this.element && this.element.document) {
        // it's a window, or looks like a window
        var doc = this.element.document.documentElement;
        this.state.pageScrollX = (this.element.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
        this.state.pageScrollY = (this.element.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);
      } else {
        // fallback
        this.state.pageScrollX = 0;
        this.state.pageScrollY = 0;
      }

      this.element.addEventListener(eventName, this.handler, false);
    }
  }, {
    key: "stop",
    value: function stop() {
      this.element.removeEventListener(eventName, this.handler, false);
    }
  }]);

  return PageScrollHandler;
}();

;

exports.default = PageScrollHandler;
},{}],13:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var delay = 1000 / 15,
    // 15fps
_timeout;

var WindowSizeHandler = function () {
  function WindowSizeHandler(window, state, buffer) {
    _classCallCheck(this, WindowSizeHandler);

    this.window = window, this.state = state, this.buffer = buffer;

    this.throttler = this.throttler.bind(this);
  }
  // ---------------------------------------------------------------------------

  _createClass(WindowSizeHandler, [{
    key: "handler",
    value: function handler(event) {
      var w = this.window.innerWidth,
          h = this.window.innerHeight,
          dT = this.state.getDT(event, 20);

      // type = 0b1000
      this.buffer.push([8, dT, w, h], [4, 20, 15, 15]);
    }
  }, {
    key: "throttler",
    value: function throttler(event) {
      if (this.timeout) {
        this.window.clearTimeout(this.timeout());
      }
    }
  }, {
    key: "timeout",
    value: function timeout() {
      var self = this;
      window.setTimeout(function () {
        _timeout = null;
        self.handler(event);
      }, delay);
    }
  }, {
    key: "start",
    value: function start() {
      this.state.wW = this.window.innerWidth;
      this.state.wH = this.window.innerHeight;
      this.window.addEventListener("resize", this.throttler, false);
    }
  }, {
    key: "stop",
    value: function stop() {
      this.window.removeEventListener("resize", this.throttler, false);
    }
  }]);

  return WindowSizeHandler;
}();

;

exports.default = WindowSizeHandler;
},{}],14:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var eventName = "positionchanged",
    longDelay = 1000 / 2,
    // 2fps
shortDelay = 1000 / 15,
    // 15fps
throttleBase = 15,
    // it's a "constant"
throttleCount = throttleBase,
    timeout;

var WindowPositionHandler = function () {
  function WindowPositionHandler(window, document, state, buffer) {
    _classCallCheck(this, WindowPositionHandler);

    this.window = window, this.document = document, this.state = state, this.buffer = buffer;

    this.handler = this.handler.bind(this);
    this.poller = this.poller.bind(this);
  }
  // ---------------------------------------------------------------------------


  _createClass(WindowPositionHandler, [{
    key: "windowPositionX",
    value: function windowPositionX() {
      return this.window.screenX || this.window.screenLeft || 0;
    }
  }, {
    key: "windowPositionY",
    value: function windowPositionY() {
      return this.window.screenY || this.window.screenTop || 0;
    }
  }, {
    key: "handler",
    value: function handler(event) {
      var dT = this.state.getDT(null, 20);

      this.state.windowPositionX = event.x;
      this.state.windowPositionY = event.y;

      // type = 0b1001
      this.buffer.push([9, dT, event.x, event.y], [4, 20, 15, 15]);
    }
  }, {
    key: "poller",
    value: function poller() {
      var x = this.windowPositionX(),
          y = this.windowPositionY();

      if (this.state.windowPositionX !== x || this.state.windowPositionY !== y) {
        var event = this.document.createEvent("CustomEvent");
        event.initEvent(eventName, true, false);
        event.x = x;
        event.y = y;
        this.window.dispatchEvent(event);

        throttleCount = throttleBase;
      }

      if (throttleCount > 0) {
        throttleCount--;
        timeout = this.window.setTimeout(this.poller, shortDelay);
      } else {
        timeout = this.window.setTimeout(this.poller, longDelay);
      }
    }
  }, {
    key: "startPoller",
    value: function startPoller() {
      this.window.setTimeout(this.poller, longDelay);
    }
  }, {
    key: "stopPoller",
    value: function stopPoller() {
      if (timeout) {
        this.window.clearTimeout(timeout);
      }
    }
  }, {
    key: "start",
    value: function start() {
      this.state.windowPositionX = this.windowPositionX();
      this.state.windowPositionY = this.windowPositionY();
      this.window.addEventListener(eventName, this.handler, false);
      this.startPoller();
    }
  }, {
    key: "stop",
    value: function stop() {
      this.stopPoller();
      this.window.removeEventListener(eventName, this.handler, false);
    }
  }]);

  return WindowPositionHandler;
}();

;

exports.default = WindowPositionHandler;
},{}],17:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var eventName = "beforeunload";

var WindowUnloadHandler = function () {
  function WindowUnloadHandler(window, state, buffer) {
    _classCallCheck(this, WindowUnloadHandler);

    this.window = window, this.state = state, this.buffer = buffer;

    this.handler = this.handler.bind(this);
  }
  // ---------------------------------------------------------------------------


  _createClass(WindowUnloadHandler, [{
    key: "handler",
    value: function handler(event) {
      var dT = this.state.getDT(event, 20);

      // 0b1001
      this.buffer.push([12, dT], [4, 20]);
    }
  }, {
    key: "start",
    value: function start() {
      this.window.addEventListener(eventName, this.handler, false);
    }
  }, {
    key: "stop",
    value: function stop() {
      this.window.removeEventListener(eventName, this.handler, false);
    }
  }]);

  return WindowUnloadHandler;
}();

;

exports.default = WindowUnloadHandler;
},{}],15:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var stateKey,
    eventKey,
    keys = {
  hidden: "visibilitychange",
  webkitHidden: "webkitvisibilitychange",
  mozHidden: "mozvisibilitychange",
  msHidden: "msvisibilitychange"
};

var VisibilityChangeHandler = function () {
  function VisibilityChangeHandler(window, state, buffer) {
    _classCallCheck(this, VisibilityChangeHandler);

    this.window = window, this.state = state, this.buffer = buffer;

    for (stateKey in keys) {
      if (stateKey in window.document) {
        eventKey = keys[stateKey];
        break;
      }
    }

    this.handler = this.handler.bind(this);
  }
  // ---------------------------------------------------------------------------


  _createClass(VisibilityChangeHandler, [{
    key: "handler",
    value: function handler(event) {
      var dT = this.state.getDT(event, 20);

      if (this.window.document[stateKey]) {
        // idle/hidden, 0b1011
        this.buffer.push([11, dT], [4, 20]);
      } else {
        // focused/visible, 0b1010
        this.buffer.push([10, dT], [4, 20]);
      }
    }
  }, {
    key: "start",
    value: function start() {
      window.addEventListener(eventKey, this.handler, false);
    }
  }, {
    key: "stop",
    value: function stop() {
      window.removeEventListener(eventKey, this.handler, false);
    }
  }]);

  return VisibilityChangeHandler;
}();

;

exports.default = VisibilityChangeHandler;
},{}],16:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var map = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

// @constant
var head = "BB"; // v2 :)

// buffer
var _buffer = "";

// Locals.
var url = "/s",
    headers = {},
    counter = 1,
    sessionID;

var Transport = function () {
  function Transport(window) {
    _classCallCheck(this, Transport);

    this.window = window, this.encodeWrapper = window.encodeURIComponent;

    this.send = this.send.bind(this);
  }
  // ---------------------------------------------------------------------------

  // @constant


  _createClass(Transport, [{
    key: "encodeValues",
    value: function encodeValues(values, sizes) {
      var idx,
          len = values.length,
          bc = 0,
          // bit counter
      cv,
          // current value
      av = 0,
          // actual value
      size,
          results = "";

      for (idx = 0; idx < len; idx++) {
        cv = values[idx];
        size = sizes[idx];
        if (cv < 0) {
          cv = 0;
        }
        if (cv > (2 << size) - 1) {
          cv = (2 << size) - 1;
        }
        if (av > 0) {
          av = av << size;
        }
        av |= cv & (1 << size) - 1;
        bc += size;
        while (bc > 6) {
          bc -= 6;
          results += map[av >>> bc];
          av &= (1 << bc) - 1;
        }
      }

      results += map[av << 6 - bc];

      return results;
    }
  }, {
    key: "encodeHeaders",
    value: function encodeHeaders(headers) {
      var headerString = "";

      for (var key in headers) {
        if (headers.hasOwnProperty(key)) {
          headerString = headerString + this.encodeWrapper(key) + "=" + this.encodeWrapper(headers[key]) + ",";
        }
      }

      return this.encodeValues([headerString.length], [12]) + headerString;
    }
  }, {
    key: "reset",


    /*
     * @private
     * Resets buffer.
     */
    value: function reset() {
      _buffer = "";
      return true;
    }

    /*
     * @private
     * Shifts available data.  That means resetting to its defaults and returning
     * already collected events.
     */

  }, {
    key: "shift",
    value: function shift() {
      var contents = _buffer;
      this.reset();
      return contents;
    }

    /*
     * @private
     * Encodes raw bytes into stream format (length + URI encoded string
     * representation).
     */

  }, {
    key: "encodeRawBytes",
    value: function encodeRawBytes(bytes) {
      var encoded = this.encodeWrapper(bytes);
      return this.encodeValues([encoded.length], [12]) + encoded;
    }
  }, {
    key: "send",
    value: function send(sync, callback) {
      try {
        var x = new (this.window.XMLHttpRequest || this.window.ActiveXObject)('MSXML2.XMLHTTP.3.0');
        x.open('POST', url, 1);
        x.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        x.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        x.onreadystatechange = function () {
          if (x.readyState === 4 && x.status === 200) {
            console.log("success");
          } else {
            console.log("fail");
          }
        };

        x.send(head + this.encodeHeaders(headers) + this.shift());
      } catch (e) {
        window.console && console.log(e);
      }
    }
  }, {
    key: "setUrl",

    /**
     * Sends data to destination.
     */
    // send(sync, callback) {
    //   var
    //     req = new window.XMLHttpRequest(),
    //     onResponse = function () {
    //       if (callback) {
    //         if ((req.readyState === 4) && (req.status === 200)) {
    //           callback(req);
    //         } else {
    //           console.log("Failure")
    //         }
    //       }
    //     },
    //     onSuccess = function () { console.log("success") }, // TODO
    //     onFailure = function () { console.log("Failure") }; // TODO

    //   // TODO make it configurable (enable/disable) w//o
    //   headers["stream-id"] = (sessionID ? sessionID : "") + "." + (counter++);

    //   if ("withCredentials" in req) { // Is it a real XMLHttpRequest2 object
    //     req.open("POST", url, !sync);
    //     req.onreadystatechange = onResponse; // TODO XMLHttpRequest2 has onload and co...
    //     req.setRequestHeader("Content-type", "text/plain");
    //     // req.withCredentials = true;
    //   } else if (typeof this.window.XDomainRequest !== "undefined") { // XDomainRequest only exists in IE
    //     req = new this.window.XDomainRequest();
    //     req.onload = onSuccess;
    //     req.onerror = onFailure;
    //     req.contentType = "text/plain";
    //     req.open("POST", url);
    //   } else if (typeof this.window.ActiveXObject !== "undefined") { // Is it OK? :)
    //     req = new this.window.ActiveXObject("Microsoft.XMLHTTP");
    //     req.open("POST", url);
    //   } else {
    //     // TODO Firefox in test mode get to this branch
    //     req.open("POST", url, !sync);
    //     req.onload = onResponse;
    //     req.setRequestHeader("Content-type", "text/plain");
    //     //req = null;
    //     //throw new Error('CORS not supported'); // TODO
    //   }
    //   console.log(head + this.encodeHeaders(headers) + this.shift());
    //   req.send(head + this.encodeHeaders(headers) + this.shift());

    //   return true;
    // };

    /**
     * Sets destination URL.
     */
    value: function setUrl(u) {
      url = u;
    }
  }, {
    key: "setHeader",


    /**
     * Sets request header k/v pair.
     */
    value: function setHeader(key, value) {
      headers[key] = value;
    }
  }, {
    key: "setSessionI",


    /**
     * Sets session ID for this session.
     */
    value: function setSessionI(s) {
      sessionID = s;
    }
  }, {
    key: "buffer",


    /**
     * Returns current buffer contents (without version magic and headers).
     */
    value: function buffer() {
      return _buffer;
    }
  }, {
    key: "push",


    /**
     * Encodes and pushes values sampled by its given size into buffer.
     */
    value: function push(values, sizes) {
      _buffer += this.encodeValues(values, sizes);
      return _buffer;
    }
  }, {
    key: "pushRawBytes",


    /**
     * Encodes raw bytes into stream format (length + URI encoded string
     * representation).
     */
    // this.encodeRawBytes = encodeRawBytes;

    /**
     * Appends raw (encoded) bytes to buffer.
     */
    value: function pushRawBytes(bytes) {
      _buffer += this.encodeRawBytes(bytes);
      return _buffer;
    }
  }]);

  return Transport;
}();

;

exports.default = Transport;
},{}],19:[function(require,module,exports) {
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],21:[function(require,module,exports) {
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],18:[function(require,module,exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],5:[function(require,module,exports) {
var global = (1,eval)("this");
var process = require("process");
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function (f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function (x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s':
        return String(args[i++]);
      case '%d':
        return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};

// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function (fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function () {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};

var debugs = {};
var debugEnviron;
exports.debuglog = function (set) {
  if (isUndefined(debugEnviron)) debugEnviron = undefined || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function () {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function () {};
    }
  }
  return debugs[set];
};

/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;

// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold': [1, 22],
  'italic': [3, 23],
  'underline': [4, 24],
  'inverse': [7, 27],
  'white': [37, 39],
  'grey': [90, 39],
  'black': [30, 39],
  'blue': [34, 39],
  'cyan': [36, 39],
  'green': [32, 39],
  'magenta': [35, 39],
  'red': [31, 39],
  'yellow': [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};

function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str + '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}

function stylizeNoColor(str, styleType) {
  return str;
}

function arrayToHash(array) {
  var hash = {};

  array.forEach(function (val, idx) {
    hash[val] = true;
  });

  return hash;
}

function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect && value && isFunction(value.inspect) &&
  // Filter out the util module, it's inspect function is special
  value.inspect !== exports.inspect &&
  // Also filter out any prototype objects using the circular check.
  !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value) && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '',
      array = false,
      braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function (key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}

function formatPrimitive(ctx, value) {
  if (isUndefined(value)) return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '').replace(/'/g, "\\'").replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value)) return ctx.stylize('' + value, 'number');
  if (isBoolean(value)) return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value)) return ctx.stylize('null', 'null');
}

function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}

function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys, String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function (key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys, key, true));
    }
  });
  return output;
}

function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function (line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function (line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'").replace(/\\"/g, '"').replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}

function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function (prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] + (base === '' ? '' : base + '\n ') + ' ' + output.join(',\n  ') + ' ' + braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}

// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) && (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null || typeof arg === 'boolean' || typeof arg === 'number' || typeof arg === 'string' || typeof arg === 'symbol' || // ES6 symbol
  typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}

function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}

var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()), pad(d.getMinutes()), pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}

// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function () {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};

/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function (origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}
},{"./support/isBuffer":19,"inherits":21,"process":18}],4:[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); // ! ci-trap v0.2.0 - MIT license 


// Motion event (mouse movement) catcher for browsers emitting data compatible
// with Cursor Insight's motion analyzer engine. (touch, gyro, etc. is WIP)

// Copyright (c) 2012--2014, GOLDA Bence <gbence@algernon.hu>
//                     2014, GOLDA Bence <bence@cursorinsight.com>
//                     2014, TÖRTELI Olivér <oliver@cursorinsight.com>

// # Data format (in ~BNF) ##########################################

//    <data> ::= <version> <headers> <events>
// <headers> ::= <header-size:12b> <url-encoded-string:<header-size in bytes>>
//  <events> ::= <event> <events> | EOS
//   <event> ::= <mouse-move> | <mouse-button>
//            | <touch-move> | <touch-change>
//             | <scroll-change>
//             | <mouse-wheel-x> | <mouse-wheel-y>
//             | <window-size-change> | <window-position-change>
//             | <visibility-change> | <unload>
//             | <marker> | <state>

// // this is (and will be) always a constant and a version id
// <version>        ::= "B" <version-letter>
// <version-letter> ::= "A" | "B" | "C" | "D" ...

// // sum: 60b
// <mouse-move> ::= 0b0000 <time-difference:20b>
//                  <mouse-screen-x:18b> <mouse-screen-y:18b>

// <touch-move> ::= 0b0001 <time-difference:20b>
//                  <empty:1b> <touch-id:5b>
//                  <touch-screen-x:18b> <touch-screen-y:18b>

// TODO: return only the differences and put "markers" (as full frames in
// video) into the stream

// // sum: 66b
// <mouse-button> ::= 0b0010 <time-difference:20b>
//                    <button-state:1b> <button-definition:5b> // button-state == 1 for "down", == 0 for "up"
//                    // <mouse-screen-x:18b> <mouse-screen-y:18b>

// <touch-change> ::= 0b0011 <time-difference:20b>
//                    <touch-state:1b> <touch-id:5b> // touch-state == 1 for "down"/"start", == 0 for "up"/"end"
//                    <touch-screen-x:18b> <touch-screen-y:18b>

// // sum: 48b
// <scroll-change> ::= 0b0100 <time-difference:20b>
//                     <sign-of-dx:1b> <abs-dx:11b>
//                     <sign-of-dy:1b> <abs-dy:11b>

// // sum: 36b
// <mouse-wheel-x> ::= 0b0110 <time-difference:20b>
//                     <sign-of-d:1b> <abs-d:11b>

// // sum: 36b
// <mouse-wheel-y> ::= 0b0111 <time-difference:20b>
//                     <sign-of-d:1b> <abs-d:11b>

// // sum: 54b
// <window-size-change> ::= 0b1000 <time-difference:20b>
//                          <inner-window-width:15b> <inner-window-height:15b>

// // sum: 54b
// <window-position-change> ::= 0b1001 <time-difference:20b>
//                             <window-position-left:15b> <window-position-top:15b>

// // sum: 24b
// <visibility-change> ::= 0b1010 <time-difference:20b> // (visible/focused)
// <visibility-change> ::= 0b1011 <time-difference:20b> // (hidden/idle)

// // sum: 24b
// <unload> ::= 0b1100 <time-difference:20b>

// // sum: variable
// <marker> ::= 0b1110 <time-difference:20b>
//              <size:12b> <url-encoded-string:<size in bytes>>

// // sum: 4+20+42+(12*18) = 282b
// <state> ::= 0b1111 <time-difference:20b>
//             <current-time-stamp:42b>
//             <mouse-screen-x:18b> <mouse-screen-y:18b>
//             // <mouse-client-x:18b> <mouse-client-y:18b> // temporarily disabled
//             <page-scroll-x(left):18b> <page-scroll-top-y(top):18b>
//             <inner-window-width:18b> <inner-window-height:18b>
//             <outer-window-width:18b> <outer-window-height:18b>
//             <window-position-left:18b> <window-position-top:18b>
//             <screen-width:18b> <screen-height:18b>

// JsDoc keyword:
// https://code.google.com/p/jsdoc-toolkit/wiki/TagReference

// @link ClassName#CITrap


//import  MouseWheelHandler = from "./mouseWheelHandler.js";


var _state = require("./state.js");

var _state2 = _interopRequireDefault(_state);

var _statehandler = require("./statehandler.js");

var _statehandler2 = _interopRequireDefault(_statehandler);

var _touchHandler = require("./touchHandler.js");

var _touchHandler2 = _interopRequireDefault(_touchHandler);

var _markerHandler = require("./markerHandler.js");

var _markerHandler2 = _interopRequireDefault(_markerHandler);

var _mouseMoveHandler = require("./mouseMoveHandler.js");

var _mouseMoveHandler2 = _interopRequireDefault(_mouseMoveHandler);

var _mouseButtonHandler = require("./mouseButtonHandler.js");

var _mouseButtonHandler2 = _interopRequireDefault(_mouseButtonHandler);

var _pageScrollHandler = require("./pageScrollHandler.js");

var _pageScrollHandler2 = _interopRequireDefault(_pageScrollHandler);

var _windowSizeHandler = require("./windowSizeHandler.js");

var _windowSizeHandler2 = _interopRequireDefault(_windowSizeHandler);

var _windowPositionHandler = require("./windowPositionHandler.js");

var _windowPositionHandler2 = _interopRequireDefault(_windowPositionHandler);

var _windowUnloadHandler = require("./windowUnloadHandler.js");

var _windowUnloadHandler2 = _interopRequireDefault(_windowUnloadHandler);

var _visibilityChangeHandler = require("./visibilityChangeHandler.js");

var _visibilityChangeHandler2 = _interopRequireDefault(_visibilityChangeHandler);

var _transport = require("./transport.js");

var _transport2 = _interopRequireDefault(_transport);

var _util = require("util");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CITrap = function () {
  function CITrap() {
    var element = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : window.document;
    var idleTimeout = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

    _classCallCheck(this, CITrap);

    var windowAlias = window,
        documentAlias = window.document,
        undefinedAlias;

    var windowSupport = element === windowAlias || element === documentAlias,
        touchSupport = "ontouchstart" in windowAlias || // works on most browsers
    "onmsgesturechange" in windowAlias; // works on ie10

    // master loop
    this.running = false;

    // Buffer + transport
    this.transport = new _transport2.default(windowAlias);

    // State
    this.state = new _state2.default(windowAlias, this.transport, idleTimeout);

    // Handlers
    this.handlers = new Array(this.state);

    this.markerHandler = new _markerHandler2.default(windowAlias, documentAlias, element, this.state, this.transport);

    this.handlers.push(new _statehandler2.default(windowAlias, documentAlias, element, this.state, this.transport));
    this.handlers.push(this.markerHandler);
    this.handlers.push(new _mouseMoveHandler2.default(element, this.state, this.transport));
    this.handlers.push(new _mouseButtonHandler2.default(element, this.state, this.transport));

    // IE 6, 7, 8 does not support scroll event on document
    // http://www.quirksmode.org/dom/events/scroll.html
    this.handlers.push(new _pageScrollHandler2.default(element === documentAlias ? windowAlias : element, this.state, this.transport));

    // handlers.push(new MouseWheelHandler.default.prototype.constructor(element, state, transport));

    if (windowSupport) {
      this.handlers.push(new _windowSizeHandler2.default(windowAlias, this.state, this.transport));
      this.handlers.push(new _windowPositionHandler2.default(windowAlias, documentAlias, this.state, this.transport));
      this.handlers.push(new _windowUnloadHandler2.default(windowAlias, this.state, this.transport));
      this.handlers.push(new _visibilityChangeHandler2.default(windowAlias, this.state, this.transport));
    }

    if (touchSupport) {
      this.handlers.push(new _touchHandler2.default(element, this.state, this.transport));
    }

    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
  }
  /*
   * Public methods
   */

  /**
   *  Starts event processing.
   */


  _createClass(CITrap, [{
    key: "start",
    value: function start(options) {
      if (this.running) {
        return;
      }
      options = options || {};
      var length = this.handlers.length,
          i = 0;
      for (; i < length; i++) {
        if (this.handlers[i] !== _util.isNullOrUndefined && typeof this.handlers[i].start === "function") {
          this.handlers[i].start(options);
        }
      }
      this.running = true;
    }

    /**
     *  Stops event processing.
     */

  }, {
    key: "stop",
    value: function stop() {
      if (!this.running) {
        return;
      }
      var length = this.handlers.length,
          i = 0;
      for (; i < length; i++) {
        if (this.handlers[i] !== _util.isNullOrUndefined && typeof this.handlers[i].stop === "function") {
          this.handlers[i].stop();
        }
      }
      this.running = false;
    }
  }, {
    key: "buffer",
    value: function buffer() {
      return this.transport.buffer();
    }
  }, {
    key: "send",
    value: function send() {
      return this.transport.send.apply(this, arguments);
    }
  }, {
    key: "setHeader",
    value: function setHeader() {
      return this.transport.setHeader.apply(this, arguments);
    }
  }, {
    key: "setUrl",
    value: function setUrl() {
      return this.transport.setUrl.apply(this, arguments);
    }
  }, {
    key: "setSessionID",
    value: function setSessionID() {
      return this.transport.setSessionID.apply(this, arguments);
    }
  }, {
    key: "mark",
    value: function mark(text) {
      if (this.markerHandler) {
        this.markerHandler.trigger(text);
      }
    }
  }]);

  return CITrap;
}();

;

/**
 * Expose CITrap
 */
exports.default = CITrap;
},{"./state.js":6,"./statehandler.js":7,"./touchHandler.js":8,"./markerHandler.js":9,"./mouseMoveHandler.js":10,"./mouseButtonHandler.js":11,"./pageScrollHandler.js":12,"./windowSizeHandler.js":13,"./windowPositionHandler.js":14,"./windowUnloadHandler.js":17,"./visibilityChangeHandler.js":15,"./transport.js":16,"util":5}],3:[function(require,module,exports) {
"use strict";

var _index = require("../../src/ci-trap/index");

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(function (global, window, document, require) {
  "use strict";
  // ---------------------------------------------------------------------------

  // Mini-apps demonstrating CITrap's functions.


  // Example 0 -- export CITrap to play around.

  window.CITrap = _index2.default;
  // end of Example 0

  // Example 1 -- start-stop-send buttons
  var ciTrap = new _index2.default();
  window.ciTrap = ciTrap;

  var ex1StartButton = document.getElementById("ex1-start"),
      ex1StopButton = document.getElementById("ex1-stop"),
      ex1ShowBufferButton = document.getElementById("ex1-show-buffer"),
      ex1MarkButton = document.getElementById("ex1-mark"),
      ex1DebugButton = document.getElementById("ex1-debug"),
      ex1SendButton = document.getElementById("ex1-send"),
      stateSpan = document.getElementById("window-state");

  ex1StartButton.addEventListener("click", function (event) {
    if (event.preventDefault) {
      event.preventDefault();
    } else {
      event.returnValue = false;
    }
    ciTrap.start();
    // Remove this when DOM-events are available in CITrap
    stateSpan.innerHTML = "processing";
  });

  ex1StopButton.addEventListener("click", function (event) {
    if (event.preventDefault) {
      event.preventDefault();
    } else {
      event.returnValue = false;
    }
    ciTrap.stop();
    // Remove this when DOM-events are available in CITrap
    stateSpan.innerHTML = "stopped";
  });

  ex1ShowBufferButton.addEventListener("click", function (event) {
    if (event.preventDefault) {
      event.preventDefault();
    } else {
      event.returnValue = false;
    }
    var pre = document.getElementById("window-buffer");
    pre.innerHTML = ciTrap.buffer();
  });

  ex1MarkButton.addEventListener("click", function (event) {
    if (event.preventDefault) {
      event.preventDefault();
    } else {
      event.returnValue = false;
    }
    var markEvent = new window.Event("ct:mark"),
        markInput = document.getElementById("ex1-mark-input"),
        text = markInput.value;
    if (text) {
      markEvent.text = text;
    }
    if (ciTrap.element) {
      ciTrap.element.dispatchEvent(markEvent);
    }
    stateSpan.innerHTML = "sent";
  });

  ex1DebugButton.addEventListener("click", function (event) {
    if (event.preventDefault) {
      event.preventDefault();
    } else {
      event.returnValue = false;
    }
    var debugEvent = new window.Event("ct:debug");
    if (ciTrap.element) {
      ciTrap.element.dispatchEvent(debugEvent);
    }
    stateSpan.innerHTML = "sent";
  });

  ex1SendButton.addEventListener("click", function (event) {
    if (event.preventDefault) {
      event.preventDefault();
    } else {
      event.returnValue = false;
    }
    ciTrap.send(false, function () {
      stateSpan.innerHTML = "sent";
    });
  });

  // end of Example 1

  // ---------------------------------------------------------------------------
})(undefined, window, document, require); /* global window document require */
},{"../../src/ci-trap/index":4}]},{},[3])