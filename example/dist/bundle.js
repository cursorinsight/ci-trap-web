/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 19);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

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


var _state = __webpack_require__(1);

var _state2 = _interopRequireDefault(_state);

var _statehandler = __webpack_require__(2);

var _statehandler2 = _interopRequireDefault(_statehandler);

var _touchHandler = __webpack_require__(3);

var _touchHandler2 = _interopRequireDefault(_touchHandler);

var _markerHandler = __webpack_require__(4);

var _markerHandler2 = _interopRequireDefault(_markerHandler);

var _mouseMoveHandler = __webpack_require__(5);

var _mouseMoveHandler2 = _interopRequireDefault(_mouseMoveHandler);

var _mouseButtonHandler = __webpack_require__(6);

var _mouseButtonHandler2 = _interopRequireDefault(_mouseButtonHandler);

var _pageScrollHandler = __webpack_require__(7);

var _pageScrollHandler2 = _interopRequireDefault(_pageScrollHandler);

var _windowSizeHandler = __webpack_require__(8);

var _windowSizeHandler2 = _interopRequireDefault(_windowSizeHandler);

var _windowPositionHandler = __webpack_require__(9);

var _windowPositionHandler2 = _interopRequireDefault(_windowPositionHandler);

var _windowUnloadHandler = __webpack_require__(10);

var _windowUnloadHandler2 = _interopRequireDefault(_windowUnloadHandler);

var _visibilityChangeHandler = __webpack_require__(11);

var _visibilityChangeHandler2 = _interopRequireDefault(_visibilityChangeHandler);

var _transport = __webpack_require__(12);

var _transport2 = _interopRequireDefault(_transport);

var _util = __webpack_require__(13);

var _keyStrokeHandler = __webpack_require__(18);

var _keyStrokeHandler2 = _interopRequireDefault(_keyStrokeHandler);

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


    // Set up defaults.
    if (element === undefinedAlias) {
      this.element = documentAlias;
    } else {
      this.element = element;
    }

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
    this.handlers.push(new _keyStrokeHandler2.default(element, this.state, this.transport));

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
      return this.transport.getBuffer();
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

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

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

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

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

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

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

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

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

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

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

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

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
      var sX = event.screenX,
          sY = event.screenY;
      this.buffer.push([2, dT, sX, sY, 0, this.button(event)], [4, 20, 18, 18, 1, 5]);
    }
  }, {
    key: "upHandler",
    value: function upHandler(event) {
      var dT = this.state.getDT(event, 20);
      var sX = event.screenX,
          sY = event.screenY;
      this.buffer.push([2, dT, sX, sY, 0, this.button(event)], [4, 20, 18, 18, 1, 5]);
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

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

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

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

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

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

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

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

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

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

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

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

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

// Locals.
var url = "/s",
    headers = {},
    counter = 1,
    sessionID;

var Transport = function () {
  function Transport(window) {
    _classCallCheck(this, Transport);

    this.window = window, this.encodeWrapper = window.encodeURIComponent;
    this.buffer = "";
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
      this.buffer = "";
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
      var contents = this.buffer;
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
    key: "getBuffer",


    /**
     * Returns current buffer contents (without version magic and headers).
     */
    value: function getBuffer() {
      return this.buffer;
    }
  }, {
    key: "push",


    /**
     * Encodes and pushes values sampled by its given size into buffer.
     */
    value: function push(values, sizes) {
      this.buffer += this.encodeValues(values, sizes);
      return this.buffer;
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
      this.buffer += this.encodeRawBytes(bytes);
      return this.buffer;
    }
  }]);

  return Transport;
}();

;

exports.default = Transport;

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global, process) {// Copyright Joyent, Inc. and other Node contributors.
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
exports.format = function(f) {
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
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
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
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
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
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
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
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
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
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
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
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
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

  var base = '', array = false, braces = ['{', '}'];

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
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
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
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
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
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
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
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = __webpack_require__(16);

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
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
exports.inherits = __webpack_require__(17);

exports._extend = function(origin, add) {
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

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(14), __webpack_require__(15)))

/***/ }),
/* 14 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 15 */
/***/ (function(module, exports) {

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


/***/ }),
/* 16 */
/***/ (function(module, exports) {

module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}

/***/ }),
/* 17 */
/***/ (function(module, exports) {

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


/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var downEventName = "keydown",
    upEventName = "keyup";

var KeyStrokeHandler = function () {
  function KeyStrokeHandler(element, state, buffer) {
    _classCallCheck(this, KeyStrokeHandler);

    this.element = element, this.state = state, this.buffer = buffer;

    this.downHandler = this.downHandler.bind(this);
    this.upHandler = this.upHandler.bind(this);
  }

  _createClass(KeyStrokeHandler, [{
    key: "downHandler",
    value: function downHandler(event) {
      var dT = this.state.getDT(event, 20);
      this.buffer.push([2, dT, 1, event.keyCode], [4, 20, 1, 5]);
    }
  }, {
    key: "upHandler",
    value: function upHandler(event) {
      var dT = this.state.getDT(event, 20);

      this.buffer.push([2, dT, 0, event.keyCode], [4, 20, 1, 5]);
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

  return KeyStrokeHandler;
}();

exports.default = KeyStrokeHandler;

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _src = __webpack_require__(0);

var _src2 = _interopRequireDefault(_src);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ciTrap = new _src2.default();

window.onload = function () {
    var startButton = document.getElementById("start");
    var stopButton = document.getElementById("stop");
    var showButton = document.getElementById("show");
    var bufferDiv = document.getElementById("buffer");

    startButton.addEventListener("click", function () {
        ciTrap.start();
    });

    stopButton.addEventListener("click", function () {
        ciTrap.stop();
    });

    showButton.addEventListener("click", function () {
        bufferDiv.innerHTML = ciTrap.buffer();
    });
};

/***/ })
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgNDUzNWVlNGI2MWUzNGRlZjJlMmQiLCJ3ZWJwYWNrOi8vLy4vc3JjL2luZGV4LmpzIiwid2VicGFjazovLy8uL3NyYy9zdGF0ZS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvc3RhdGVoYW5kbGVyLmpzIiwid2VicGFjazovLy8uL3NyYy90b3VjaEhhbmRsZXIuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL21hcmtlckhhbmRsZXIuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL21vdXNlTW92ZUhhbmRsZXIuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL21vdXNlQnV0dG9uSGFuZGxlci5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvcGFnZVNjcm9sbEhhbmRsZXIuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3dpbmRvd1NpemVIYW5kbGVyLmpzIiwid2VicGFjazovLy8uL3NyYy93aW5kb3dQb3NpdGlvbkhhbmRsZXIuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3dpbmRvd1VubG9hZEhhbmRsZXIuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3Zpc2liaWxpdHlDaGFuZ2VIYW5kbGVyLmpzIiwid2VicGFjazovLy8uL3NyYy90cmFuc3BvcnQuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL3V0aWwvdXRpbC5qcyIsIndlYnBhY2s6Ly8vKHdlYnBhY2spL2J1aWxkaW4vZ2xvYmFsLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL3V0aWwvc3VwcG9ydC9pc0J1ZmZlckJyb3dzZXIuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2luaGVyaXRzL2luaGVyaXRzX2Jyb3dzZXIuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2tleVN0cm9rZUhhbmRsZXIuanMiLCJ3ZWJwYWNrOi8vLy4vZXhhbXBsZS9hcHAuanMiXSwibmFtZXMiOlsiQ0lUcmFwIiwiZWxlbWVudCIsIndpbmRvdyIsImRvY3VtZW50IiwiaWRsZVRpbWVvdXQiLCJ3aW5kb3dBbGlhcyIsImRvY3VtZW50QWxpYXMiLCJ1bmRlZmluZWRBbGlhcyIsIndpbmRvd1N1cHBvcnQiLCJ0b3VjaFN1cHBvcnQiLCJydW5uaW5nIiwidHJhbnNwb3J0IiwiVHJhbnNwb3J0Iiwic3RhdGUiLCJTdGF0ZSIsImhhbmRsZXJzIiwiQXJyYXkiLCJtYXJrZXJIYW5kbGVyIiwiTWFya2VySGFuZGxlciIsInB1c2giLCJTdGF0ZUhhbmRsZXIiLCJNb3VzZU1vdmVIYW5kbGVyIiwiTW91c2VCdXR0b25IYW5kbGVyIiwiS2V5U3Ryb2tlSGFuZGxlciIsIlBhZ2VTY3JvbGxIYW5kbGVyIiwiV2luZG93U2l6ZUhhbmRsZXIiLCJXaW5kb3dQb3NpdGlvbkhhbmRsZXIiLCJXaW5kb3dVbmxvYWRIYW5kbGVyIiwiVmlzaWJpbGl0eUNoYW5nZUhhbmRsZXIiLCJUb3VjaEhhbmRsZXIiLCJzdGFydCIsImJpbmQiLCJzdG9wIiwib3B0aW9ucyIsImxlbmd0aCIsImkiLCJpc051bGxPclVuZGVmaW5lZCIsImdldEJ1ZmZlciIsInNlbmQiLCJhcHBseSIsImFyZ3VtZW50cyIsInNldEhlYWRlciIsInNldFVybCIsInNldFNlc3Npb25JRCIsInRleHQiLCJ0cmlnZ2VyIiwiaWRsZVRpbWVyIiwiZXBvY2hUcyIsImxhc3RUcyIsImdldERUIiwiaWRsZUhhbmRsZXIiLCJldmVudCIsImJpdHMiLCJyb3VuZCIsIk1hdGgiLCJjdXJyZW50VHMiLCJ0aW1lU3RhbXAiLCJEYXRlIiwiZ2V0VGltZSIsImRUIiwiY2xlYXJUaW1lb3V0IiwidW5kZWZpbmVkIiwic2V0VGltZW91dCIsIm1heCIsImV2ZW50TmFtZSIsImJ1ZmZlciIsImhhbmRsZXIiLCJtb3VzZVNjcmVlblgiLCJtb3VzZVNjcmVlblkiLCJwYWdlU2Nyb2xsWCIsInBhZ2VTY3JvbGxZIiwiaW5uZXJXaWR0aCIsImlubmVySGVpZ2h0Iiwib3V0ZXJXaWR0aCIsIm91dGVySGVpZ2h0Iiwic2NyZWVuWCIsInNjcmVlbkxlZnQiLCJzY3JlZW5ZIiwic2NyZWVuVG9wIiwic2NyZWVuIiwid2lkdGgiLCJoZWlnaHQiLCJzdGF0ZUV2ZW50IiwiY3JlYXRlRXZlbnQiLCJpbml0RXZlbnQiLCJkaXNwYXRjaEV2ZW50IiwiYWRkRXZlbnRMaXN0ZW5lciIsImluaXRpYWxTdGF0ZSIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJzdGFydEV2ZW50TmFtZSIsImVuZEV2ZW50TmFtZSIsIm1vdmVFdmVudE5hbWUiLCJ0b3VjaElkVG9JZCIsInN0YXJ0SGFuZGxlciIsIm1vdmVIYW5kbGVyIiwiZW5kSGFuZGxlciIsInRvdWNoSWQiLCJmaXJzdEZyZWUiLCJwb3AiLCJjaGFuZ2VkVG91Y2hlcyIsImV2IiwiaWQiLCJyZXNvbHZlSWQiLCJpZGVudGlmaWVyIiwicmVtb3ZlSWQiLCJkZWZhdWx0VGV4dCIsInB1c2hSYXdCeXRlcyIsIm1hcmtFdmVudCIsInNYIiwic1kiLCJkb3duRXZlbnROYW1lIiwidXBFdmVudE5hbWUiLCJkb3duSGFuZGxlciIsInVwSGFuZGxlciIsImJiIiwid2hpY2giLCJiIiwiYnV0dG9uIiwiYWJzIiwicFgiLCJwWSIsImRYIiwiZFkiLCJzaWduRFgiLCJzaWduRFkiLCJhYnNEWCIsImFic0RZIiwiZG9jIiwiZG9jdW1lbnRFbGVtZW50IiwicGFnZVhPZmZzZXQiLCJzY3JvbGxMZWZ0IiwiY2xpZW50TGVmdCIsInBhZ2VZT2Zmc2V0Iiwic2Nyb2xsVG9wIiwiY2xpZW50VG9wIiwicGFnZVgiLCJwYWdlWSIsImRlbGF5IiwidGltZW91dCIsInRocm90dGxlciIsInciLCJoIiwic2VsZiIsIndXIiwid0giLCJsb25nRGVsYXkiLCJzaG9ydERlbGF5IiwidGhyb3R0bGVCYXNlIiwidGhyb3R0bGVDb3VudCIsInBvbGxlciIsIndpbmRvd1Bvc2l0aW9uWCIsIngiLCJ3aW5kb3dQb3NpdGlvblkiLCJ5Iiwic3RhcnRQb2xsZXIiLCJzdG9wUG9sbGVyIiwic3RhdGVLZXkiLCJldmVudEtleSIsImtleXMiLCJoaWRkZW4iLCJ3ZWJraXRIaWRkZW4iLCJtb3pIaWRkZW4iLCJtc0hpZGRlbiIsIm1hcCIsImhlYWQiLCJ1cmwiLCJoZWFkZXJzIiwiY291bnRlciIsInNlc3Npb25JRCIsImVuY29kZVdyYXBwZXIiLCJlbmNvZGVVUklDb21wb25lbnQiLCJ2YWx1ZXMiLCJzaXplcyIsImlkeCIsImxlbiIsImJjIiwiY3YiLCJhdiIsInNpemUiLCJyZXN1bHRzIiwiaGVhZGVyU3RyaW5nIiwia2V5IiwiaGFzT3duUHJvcGVydHkiLCJlbmNvZGVWYWx1ZXMiLCJjb250ZW50cyIsInJlc2V0IiwiYnl0ZXMiLCJlbmNvZGVkIiwic3luYyIsImNhbGxiYWNrIiwiWE1MSHR0cFJlcXVlc3QiLCJBY3RpdmVYT2JqZWN0Iiwib3BlbiIsInNldFJlcXVlc3RIZWFkZXIiLCJvbnJlYWR5c3RhdGVjaGFuZ2UiLCJyZWFkeVN0YXRlIiwic3RhdHVzIiwiY29uc29sZSIsImxvZyIsImVuY29kZUhlYWRlcnMiLCJzaGlmdCIsImUiLCJ1IiwidmFsdWUiLCJzIiwiZW5jb2RlUmF3Qnl0ZXMiLCJrZXlDb2RlIiwiY2lUcmFwIiwib25sb2FkIiwic3RhcnRCdXR0b24iLCJnZXRFbGVtZW50QnlJZCIsInN0b3BCdXR0b24iLCJzaG93QnV0dG9uIiwiYnVmZmVyRGl2IiwiaW5uZXJIVE1MIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG1DQUEyQiwwQkFBMEIsRUFBRTtBQUN2RCx5Q0FBaUMsZUFBZTtBQUNoRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw4REFBc0QsK0RB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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBOzs7QUFHQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSw0Q0FBNEMsS0FBSzs7QUFFakQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0EsS0FBSztBQUNMOztBQUVBOztBQUVBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTtBQUNBLG1DQUFtQyxPQUFPO0FBQzFDO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQSx5REFBeUQ7QUFDekQ7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1gsU0FBUztBQUNUO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOzs7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBOzs7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLFNBQVM7QUFDcEI7QUFDQSxXQUFXLFNBQVM7QUFDcEI7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7Ozs7OztBQ3prQkE7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsQ0FBQzs7QUFFRDtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLDRDQUE0Qzs7QUFFNUM7Ozs7Ozs7QUNwQkE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBOzs7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FBSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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QUFnQixZQUFNO0FBQ2xCLFFBQUlDLGNBQWM5TSxTQUFTK00sY0FBVCxDQUF3QixPQUF4QixDQUFsQjtBQUNBLFFBQUlDLGFBQWFoTixTQUFTK00sY0FBVCxDQUF3QixNQUF4QixDQUFqQjtBQUNBLFFBQUlFLGFBQWFqTixTQUFTK00sY0FBVCxDQUF3QixNQUF4QixDQUFqQjtBQUNBLFFBQUlHLFlBQVlsTixTQUFTK00sY0FBVCxDQUF3QixRQUF4QixDQUFoQjs7QUFHQUQsZ0JBQVkzSCxnQkFBWixDQUE2QixPQUE3QixFQUFzQyxZQUFNO0FBQ3hDeUgsZUFBT2pMLEtBQVA7QUFDSCxLQUZEOztBQUlBcUwsZUFBVzdILGdCQUFYLENBQTRCLE9BQTVCLEVBQXFDLFlBQU07QUFDdkN5SCxlQUFPL0ssSUFBUDtBQUNILEtBRkQ7O0FBSUFvTCxlQUFXOUgsZ0JBQVgsQ0FBNEIsT0FBNUIsRUFBcUMsWUFBTTtBQUN2QytILGtCQUFVQyxTQUFWLEdBQXNCUCxPQUFPOUksTUFBUCxFQUF0QjtBQUNILEtBRkQ7QUFHSCxDQWxCRCxDIiwiZmlsZSI6Ii4vZXhhbXBsZS9kaXN0L2J1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbiBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4gXHRcdFx0XHRnZXQ6IGdldHRlclxuIFx0XHRcdH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IDE5KTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyB3ZWJwYWNrL2Jvb3RzdHJhcCA0NTM1ZWU0YjYxZTM0ZGVmMmUyZCIsIi8vICEgY2ktdHJhcCB2MC4yLjAgLSBNSVQgbGljZW5zZSBcclxuXHJcblxyXG4vLyBNb3Rpb24gZXZlbnQgKG1vdXNlIG1vdmVtZW50KSBjYXRjaGVyIGZvciBicm93c2VycyBlbWl0dGluZyBkYXRhIGNvbXBhdGlibGVcclxuLy8gd2l0aCBDdXJzb3IgSW5zaWdodCdzIG1vdGlvbiBhbmFseXplciBlbmdpbmUuICh0b3VjaCwgZ3lybywgZXRjLiBpcyBXSVApXHJcblxyXG4vLyBDb3B5cmlnaHQgKGMpIDIwMTItLTIwMTQsIEdPTERBIEJlbmNlIDxnYmVuY2VAYWxnZXJub24uaHU+XHJcbi8vICAgICAgICAgICAgICAgICAgICAgMjAxNCwgR09MREEgQmVuY2UgPGJlbmNlQGN1cnNvcmluc2lnaHQuY29tPlxyXG4vLyAgICAgICAgICAgICAgICAgICAgIDIwMTQsIFTDllJURUxJIE9saXbDqXIgPG9saXZlckBjdXJzb3JpbnNpZ2h0LmNvbT5cclxuXHJcbi8vICMgRGF0YSBmb3JtYXQgKGluIH5CTkYpICMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xyXG5cclxuLy8gICAgPGRhdGE+IDo6PSA8dmVyc2lvbj4gPGhlYWRlcnM+IDxldmVudHM+XHJcbi8vIDxoZWFkZXJzPiA6Oj0gPGhlYWRlci1zaXplOjEyYj4gPHVybC1lbmNvZGVkLXN0cmluZzo8aGVhZGVyLXNpemUgaW4gYnl0ZXM+PlxyXG4vLyAgPGV2ZW50cz4gOjo9IDxldmVudD4gPGV2ZW50cz4gfCBFT1NcclxuLy8gICA8ZXZlbnQ+IDo6PSA8bW91c2UtbW92ZT4gfCA8bW91c2UtYnV0dG9uPlxyXG4vLyAgICAgICAgICAgIHwgPHRvdWNoLW1vdmU+IHwgPHRvdWNoLWNoYW5nZT5cclxuLy8gICAgICAgICAgICAgfCA8c2Nyb2xsLWNoYW5nZT5cclxuLy8gICAgICAgICAgICAgfCA8bW91c2Utd2hlZWwteD4gfCA8bW91c2Utd2hlZWwteT5cclxuLy8gICAgICAgICAgICAgfCA8d2luZG93LXNpemUtY2hhbmdlPiB8IDx3aW5kb3ctcG9zaXRpb24tY2hhbmdlPlxyXG4vLyAgICAgICAgICAgICB8IDx2aXNpYmlsaXR5LWNoYW5nZT4gfCA8dW5sb2FkPlxyXG4vLyAgICAgICAgICAgICB8IDxtYXJrZXI+IHwgPHN0YXRlPlxyXG5cclxuLy8gLy8gdGhpcyBpcyAoYW5kIHdpbGwgYmUpIGFsd2F5cyBhIGNvbnN0YW50IGFuZCBhIHZlcnNpb24gaWRcclxuLy8gPHZlcnNpb24+ICAgICAgICA6Oj0gXCJCXCIgPHZlcnNpb24tbGV0dGVyPlxyXG4vLyA8dmVyc2lvbi1sZXR0ZXI+IDo6PSBcIkFcIiB8IFwiQlwiIHwgXCJDXCIgfCBcIkRcIiAuLi5cclxuXHJcbi8vIC8vIHN1bTogNjBiXHJcbi8vIDxtb3VzZS1tb3ZlPiA6Oj0gMGIwMDAwIDx0aW1lLWRpZmZlcmVuY2U6MjBiPlxyXG4vLyAgICAgICAgICAgICAgICAgIDxtb3VzZS1zY3JlZW4teDoxOGI+IDxtb3VzZS1zY3JlZW4teToxOGI+XHJcblxyXG4vLyA8dG91Y2gtbW92ZT4gOjo9IDBiMDAwMSA8dGltZS1kaWZmZXJlbmNlOjIwYj5cclxuLy8gICAgICAgICAgICAgICAgICA8ZW1wdHk6MWI+IDx0b3VjaC1pZDo1Yj5cclxuLy8gICAgICAgICAgICAgICAgICA8dG91Y2gtc2NyZWVuLXg6MThiPiA8dG91Y2gtc2NyZWVuLXk6MThiPlxyXG5cclxuLy8gVE9ETzogcmV0dXJuIG9ubHkgdGhlIGRpZmZlcmVuY2VzIGFuZCBwdXQgXCJtYXJrZXJzXCIgKGFzIGZ1bGwgZnJhbWVzIGluXHJcbi8vIHZpZGVvKSBpbnRvIHRoZSBzdHJlYW1cclxuXHJcbi8vIC8vIHN1bTogNjZiXHJcbi8vIDxtb3VzZS1idXR0b24+IDo6PSAwYjAwMTAgPHRpbWUtZGlmZmVyZW5jZToyMGI+XHJcbi8vICAgICAgICAgICAgICAgICAgICA8YnV0dG9uLXN0YXRlOjFiPiA8YnV0dG9uLWRlZmluaXRpb246NWI+IC8vIGJ1dHRvbi1zdGF0ZSA9PSAxIGZvciBcImRvd25cIiwgPT0gMCBmb3IgXCJ1cFwiXHJcbi8vICAgICAgICAgICAgICAgICAgICAvLyA8bW91c2Utc2NyZWVuLXg6MThiPiA8bW91c2Utc2NyZWVuLXk6MThiPlxyXG5cclxuLy8gPHRvdWNoLWNoYW5nZT4gOjo9IDBiMDAxMSA8dGltZS1kaWZmZXJlbmNlOjIwYj5cclxuLy8gICAgICAgICAgICAgICAgICAgIDx0b3VjaC1zdGF0ZToxYj4gPHRvdWNoLWlkOjViPiAvLyB0b3VjaC1zdGF0ZSA9PSAxIGZvciBcImRvd25cIi9cInN0YXJ0XCIsID09IDAgZm9yIFwidXBcIi9cImVuZFwiXHJcbi8vICAgICAgICAgICAgICAgICAgICA8dG91Y2gtc2NyZWVuLXg6MThiPiA8dG91Y2gtc2NyZWVuLXk6MThiPlxyXG5cclxuLy8gLy8gc3VtOiA0OGJcclxuLy8gPHNjcm9sbC1jaGFuZ2U+IDo6PSAwYjAxMDAgPHRpbWUtZGlmZmVyZW5jZToyMGI+XHJcbi8vICAgICAgICAgICAgICAgICAgICAgPHNpZ24tb2YtZHg6MWI+IDxhYnMtZHg6MTFiPlxyXG4vLyAgICAgICAgICAgICAgICAgICAgIDxzaWduLW9mLWR5OjFiPiA8YWJzLWR5OjExYj5cclxuXHJcbi8vIC8vIHN1bTogMzZiXHJcbi8vIDxtb3VzZS13aGVlbC14PiA6Oj0gMGIwMTEwIDx0aW1lLWRpZmZlcmVuY2U6MjBiPlxyXG4vLyAgICAgICAgICAgICAgICAgICAgIDxzaWduLW9mLWQ6MWI+IDxhYnMtZDoxMWI+XHJcblxyXG4vLyAvLyBzdW06IDM2YlxyXG4vLyA8bW91c2Utd2hlZWwteT4gOjo9IDBiMDExMSA8dGltZS1kaWZmZXJlbmNlOjIwYj5cclxuLy8gICAgICAgICAgICAgICAgICAgICA8c2lnbi1vZi1kOjFiPiA8YWJzLWQ6MTFiPlxyXG5cclxuLy8gLy8gc3VtOiA1NGJcclxuLy8gPHdpbmRvdy1zaXplLWNoYW5nZT4gOjo9IDBiMTAwMCA8dGltZS1kaWZmZXJlbmNlOjIwYj5cclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgIDxpbm5lci13aW5kb3ctd2lkdGg6MTViPiA8aW5uZXItd2luZG93LWhlaWdodDoxNWI+XHJcblxyXG4vLyAvLyBzdW06IDU0YlxyXG4vLyA8d2luZG93LXBvc2l0aW9uLWNoYW5nZT4gOjo9IDBiMTAwMSA8dGltZS1kaWZmZXJlbmNlOjIwYj5cclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx3aW5kb3ctcG9zaXRpb24tbGVmdDoxNWI+IDx3aW5kb3ctcG9zaXRpb24tdG9wOjE1Yj5cclxuXHJcbi8vIC8vIHN1bTogMjRiXHJcbi8vIDx2aXNpYmlsaXR5LWNoYW5nZT4gOjo9IDBiMTAxMCA8dGltZS1kaWZmZXJlbmNlOjIwYj4gLy8gKHZpc2libGUvZm9jdXNlZClcclxuLy8gPHZpc2liaWxpdHktY2hhbmdlPiA6Oj0gMGIxMDExIDx0aW1lLWRpZmZlcmVuY2U6MjBiPiAvLyAoaGlkZGVuL2lkbGUpXHJcblxyXG4vLyAvLyBzdW06IDI0YlxyXG4vLyA8dW5sb2FkPiA6Oj0gMGIxMTAwIDx0aW1lLWRpZmZlcmVuY2U6MjBiPlxyXG5cclxuLy8gLy8gc3VtOiB2YXJpYWJsZVxyXG4vLyA8bWFya2VyPiA6Oj0gMGIxMTEwIDx0aW1lLWRpZmZlcmVuY2U6MjBiPlxyXG4vLyAgICAgICAgICAgICAgPHNpemU6MTJiPiA8dXJsLWVuY29kZWQtc3RyaW5nOjxzaXplIGluIGJ5dGVzPj5cclxuXHJcbi8vIC8vIHN1bTogNCsyMCs0MisoMTIqMTgpID0gMjgyYlxyXG4vLyA8c3RhdGU+IDo6PSAwYjExMTEgPHRpbWUtZGlmZmVyZW5jZToyMGI+XHJcbi8vICAgICAgICAgICAgIDxjdXJyZW50LXRpbWUtc3RhbXA6NDJiPlxyXG4vLyAgICAgICAgICAgICA8bW91c2Utc2NyZWVuLXg6MThiPiA8bW91c2Utc2NyZWVuLXk6MThiPlxyXG4vLyAgICAgICAgICAgICAvLyA8bW91c2UtY2xpZW50LXg6MThiPiA8bW91c2UtY2xpZW50LXk6MThiPiAvLyB0ZW1wb3JhcmlseSBkaXNhYmxlZFxyXG4vLyAgICAgICAgICAgICA8cGFnZS1zY3JvbGwteChsZWZ0KToxOGI+IDxwYWdlLXNjcm9sbC10b3AteSh0b3ApOjE4Yj5cclxuLy8gICAgICAgICAgICAgPGlubmVyLXdpbmRvdy13aWR0aDoxOGI+IDxpbm5lci13aW5kb3ctaGVpZ2h0OjE4Yj5cclxuLy8gICAgICAgICAgICAgPG91dGVyLXdpbmRvdy13aWR0aDoxOGI+IDxvdXRlci13aW5kb3ctaGVpZ2h0OjE4Yj5cclxuLy8gICAgICAgICAgICAgPHdpbmRvdy1wb3NpdGlvbi1sZWZ0OjE4Yj4gPHdpbmRvdy1wb3NpdGlvbi10b3A6MThiPlxyXG4vLyAgICAgICAgICAgICA8c2NyZWVuLXdpZHRoOjE4Yj4gPHNjcmVlbi1oZWlnaHQ6MThiPlxyXG5cclxuLy8gSnNEb2Mga2V5d29yZDpcclxuLy8gaHR0cHM6Ly9jb2RlLmdvb2dsZS5jb20vcC9qc2RvYy10b29sa2l0L3dpa2kvVGFnUmVmZXJlbmNlXHJcblxyXG4vLyBAbGluayBDbGFzc05hbWUjQ0lUcmFwXHJcblxyXG5cclxuaW1wb3J0IFN0YXRlIGZyb20gXCIuL3N0YXRlLmpzXCI7XHJcbmltcG9ydCBTdGF0ZUhhbmRsZXIgZnJvbSBcIi4vc3RhdGVoYW5kbGVyLmpzXCI7XHJcbmltcG9ydCBUb3VjaEhhbmRsZXIgZnJvbSBcIi4vdG91Y2hIYW5kbGVyLmpzXCI7XHJcbmltcG9ydCBNYXJrZXJIYW5kbGVyIGZyb20gXCIuL21hcmtlckhhbmRsZXIuanNcIjtcclxuaW1wb3J0IE1vdXNlTW92ZUhhbmRsZXIgZnJvbSBcIi4vbW91c2VNb3ZlSGFuZGxlci5qc1wiO1xyXG5pbXBvcnQgTW91c2VCdXR0b25IYW5kbGVyIGZyb20gXCIuL21vdXNlQnV0dG9uSGFuZGxlci5qc1wiO1xyXG5pbXBvcnQgUGFnZVNjcm9sbEhhbmRsZXIgZnJvbSBcIi4vcGFnZVNjcm9sbEhhbmRsZXIuanNcIjtcclxuaW1wb3J0IFdpbmRvd1NpemVIYW5kbGVyIGZyb20gXCIuL3dpbmRvd1NpemVIYW5kbGVyLmpzXCI7XHJcbmltcG9ydCBXaW5kb3dQb3NpdGlvbkhhbmRsZXIgZnJvbSBcIi4vd2luZG93UG9zaXRpb25IYW5kbGVyLmpzXCI7XHJcbmltcG9ydCBXaW5kb3dVbmxvYWRIYW5kbGVyIGZyb20gXCIuL3dpbmRvd1VubG9hZEhhbmRsZXIuanNcIjtcclxuaW1wb3J0IFZpc2liaWxpdHlDaGFuZ2VIYW5kbGVyIGZyb20gXCIuL3Zpc2liaWxpdHlDaGFuZ2VIYW5kbGVyLmpzXCI7XHJcbi8vaW1wb3J0ICBNb3VzZVdoZWVsSGFuZGxlciA9IGZyb20gXCIuL21vdXNlV2hlZWxIYW5kbGVyLmpzXCI7XHJcbmltcG9ydCBUcmFuc3BvcnQgZnJvbSBcIi4vdHJhbnNwb3J0LmpzXCI7XHJcbmltcG9ydCB7XHJcbiAgaXNOdWxsT3JVbmRlZmluZWRcclxufSBmcm9tIFwidXRpbFwiO1xyXG5pbXBvcnQgS2V5U3Ryb2tlSGFuZGxlciBmcm9tIFwiLi9rZXlTdHJva2VIYW5kbGVyLmpzXCI7XHJcblxyXG5cclxuY2xhc3MgQ0lUcmFwIHtcclxuICBjb25zdHJ1Y3RvcihlbGVtZW50ID0gd2luZG93LmRvY3VtZW50LCBpZGxlVGltZW91dCA9IDApIHtcclxuXHJcblxyXG4gICAgdmFyXHJcbiAgICAgIHdpbmRvd0FsaWFzID0gd2luZG93LFxyXG4gICAgICBkb2N1bWVudEFsaWFzID0gd2luZG93LmRvY3VtZW50LFxyXG4gICAgICB1bmRlZmluZWRBbGlhcztcclxuXHJcbiAgICB2YXJcclxuICAgICAgd2luZG93U3VwcG9ydCA9IChlbGVtZW50ID09PSB3aW5kb3dBbGlhcyB8fCBlbGVtZW50ID09PSBkb2N1bWVudEFsaWFzKSxcclxuICAgICAgdG91Y2hTdXBwb3J0ID0gXCJvbnRvdWNoc3RhcnRcIiBpbiB3aW5kb3dBbGlhcyB8fCAvLyB3b3JrcyBvbiBtb3N0IGJyb3dzZXJzXHJcbiAgICAgIFwib25tc2dlc3R1cmVjaGFuZ2VcIiBpbiB3aW5kb3dBbGlhczsgLy8gd29ya3Mgb24gaWUxMFxyXG5cclxuXHJcbiAgICAvLyBTZXQgdXAgZGVmYXVsdHMuXHJcbiAgICBpZiAoZWxlbWVudCA9PT0gdW5kZWZpbmVkQWxpYXMpIHtcclxuICAgICAgdGhpcy5lbGVtZW50ID0gZG9jdW1lbnRBbGlhcztcclxuICAgIH1lbHNle1xyXG4gICAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvLyBtYXN0ZXIgbG9vcFxyXG4gICAgdGhpcy5ydW5uaW5nID0gZmFsc2U7XHJcblxyXG4gICAgLy8gQnVmZmVyICsgdHJhbnNwb3J0XHJcbiAgICB0aGlzLnRyYW5zcG9ydCA9IG5ldyBUcmFuc3BvcnQod2luZG93QWxpYXMpO1xyXG5cclxuICAgIC8vIFN0YXRlXHJcbiAgICB0aGlzLnN0YXRlID0gbmV3IFN0YXRlKHdpbmRvd0FsaWFzLCB0aGlzLnRyYW5zcG9ydCwgaWRsZVRpbWVvdXQpO1xyXG5cclxuICAgIC8vIEhhbmRsZXJzXHJcbiAgICB0aGlzLmhhbmRsZXJzID0gbmV3IEFycmF5KHRoaXMuc3RhdGUpO1xyXG5cclxuXHJcblxyXG4gICAgdGhpcy5tYXJrZXJIYW5kbGVyID0gbmV3IE1hcmtlckhhbmRsZXIod2luZG93QWxpYXMsIGRvY3VtZW50QWxpYXMsIGVsZW1lbnQsIHRoaXMuc3RhdGUsIHRoaXMudHJhbnNwb3J0KTtcclxuXHJcbiAgICB0aGlzLmhhbmRsZXJzLnB1c2gobmV3IFN0YXRlSGFuZGxlcih3aW5kb3dBbGlhcywgZG9jdW1lbnRBbGlhcywgZWxlbWVudCwgdGhpcy5zdGF0ZSwgdGhpcy50cmFuc3BvcnQpKTtcclxuICAgIHRoaXMuaGFuZGxlcnMucHVzaCh0aGlzLm1hcmtlckhhbmRsZXIpO1xyXG4gICAgdGhpcy5oYW5kbGVycy5wdXNoKG5ldyBNb3VzZU1vdmVIYW5kbGVyKGVsZW1lbnQsIHRoaXMuc3RhdGUsIHRoaXMudHJhbnNwb3J0KSk7XHJcbiAgICB0aGlzLmhhbmRsZXJzLnB1c2gobmV3IE1vdXNlQnV0dG9uSGFuZGxlcihlbGVtZW50LCB0aGlzLnN0YXRlLCB0aGlzLnRyYW5zcG9ydCkpO1xyXG4gICAgdGhpcy5oYW5kbGVycy5wdXNoKG5ldyBLZXlTdHJva2VIYW5kbGVyKGVsZW1lbnQsIHRoaXMuc3RhdGUsIHRoaXMudHJhbnNwb3J0KSk7XHJcblxyXG4gICAgLy8gSUUgNiwgNywgOCBkb2VzIG5vdCBzdXBwb3J0IHNjcm9sbCBldmVudCBvbiBkb2N1bWVudFxyXG4gICAgLy8gaHR0cDovL3d3dy5xdWlya3Ntb2RlLm9yZy9kb20vZXZlbnRzL3Njcm9sbC5odG1sXHJcbiAgICB0aGlzLmhhbmRsZXJzLnB1c2gobmV3IFBhZ2VTY3JvbGxIYW5kbGVyKGVsZW1lbnQgPT09IGRvY3VtZW50QWxpYXMgPyB3aW5kb3dBbGlhcyA6IGVsZW1lbnQsIHRoaXMuc3RhdGUsIHRoaXMudHJhbnNwb3J0KSk7XHJcblxyXG4gICAgLy8gaGFuZGxlcnMucHVzaChuZXcgTW91c2VXaGVlbEhhbmRsZXIuZGVmYXVsdC5wcm90b3R5cGUuY29uc3RydWN0b3IoZWxlbWVudCwgc3RhdGUsIHRyYW5zcG9ydCkpO1xyXG5cclxuICAgIGlmICh3aW5kb3dTdXBwb3J0KSB7XHJcbiAgICAgIHRoaXMuaGFuZGxlcnMucHVzaChuZXcgV2luZG93U2l6ZUhhbmRsZXIod2luZG93QWxpYXMsIHRoaXMuc3RhdGUsIHRoaXMudHJhbnNwb3J0KSk7XHJcbiAgICAgIHRoaXMuaGFuZGxlcnMucHVzaChuZXcgV2luZG93UG9zaXRpb25IYW5kbGVyKHdpbmRvd0FsaWFzLCBkb2N1bWVudEFsaWFzLCB0aGlzLnN0YXRlLCB0aGlzLnRyYW5zcG9ydCkpO1xyXG4gICAgICB0aGlzLmhhbmRsZXJzLnB1c2gobmV3IFdpbmRvd1VubG9hZEhhbmRsZXIod2luZG93QWxpYXMsIHRoaXMuc3RhdGUsIHRoaXMudHJhbnNwb3J0KSk7XHJcbiAgICAgIHRoaXMuaGFuZGxlcnMucHVzaChuZXcgVmlzaWJpbGl0eUNoYW5nZUhhbmRsZXIod2luZG93QWxpYXMsIHRoaXMuc3RhdGUsIHRoaXMudHJhbnNwb3J0KSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRvdWNoU3VwcG9ydCkge1xyXG4gICAgICB0aGlzLmhhbmRsZXJzLnB1c2gobmV3IFRvdWNoSGFuZGxlcihlbGVtZW50LCB0aGlzLnN0YXRlLCB0aGlzLnRyYW5zcG9ydCkpO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICB0aGlzLnN0YXJ0ID0gdGhpcy5zdGFydC5iaW5kKHRoaXMpO1xyXG4gICAgdGhpcy5zdG9wID0gdGhpcy5zdG9wLmJpbmQodGhpcyk7XHJcbiAgfVxyXG4gIC8qXHJcbiAgICogUHVibGljIG1ldGhvZHNcclxuICAgKi9cclxuXHJcbiAgLyoqXHJcbiAgICogIFN0YXJ0cyBldmVudCBwcm9jZXNzaW5nLlxyXG4gICAqL1xyXG4gIHN0YXJ0KG9wdGlvbnMpIHtcclxuICAgIGlmICh0aGlzLnJ1bm5pbmcpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XHJcbiAgICB2YXIgbGVuZ3RoID0gdGhpcy5oYW5kbGVycy5sZW5ndGgsXHJcbiAgICAgIGkgPSAwO1xyXG4gICAgZm9yICg7IGkgPCBsZW5ndGg7IGkrKykge1xyXG4gICAgICBpZiAoKHRoaXMuaGFuZGxlcnNbaV0gIT09IGlzTnVsbE9yVW5kZWZpbmVkKSAmJiAodHlwZW9mIHRoaXMuaGFuZGxlcnNbaV0uc3RhcnQgPT09IFwiZnVuY3Rpb25cIikpIHtcclxuICAgICAgICB0aGlzLmhhbmRsZXJzW2ldLnN0YXJ0KG9wdGlvbnMpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICB0aGlzLnJ1bm5pbmcgPSB0cnVlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogIFN0b3BzIGV2ZW50IHByb2Nlc3NpbmcuXHJcbiAgICovXHJcbiAgc3RvcCgpIHtcclxuICAgIGlmICghdGhpcy5ydW5uaW5nKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIHZhciBsZW5ndGggPSB0aGlzLmhhbmRsZXJzLmxlbmd0aCxcclxuICAgICAgaSA9IDA7XHJcbiAgICBmb3IgKDsgaSA8IGxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIGlmICgodGhpcy5oYW5kbGVyc1tpXSAhPT0gaXNOdWxsT3JVbmRlZmluZWQpICYmICh0eXBlb2YgdGhpcy5oYW5kbGVyc1tpXS5zdG9wID09PSBcImZ1bmN0aW9uXCIpKSB7XHJcbiAgICAgICAgdGhpcy5oYW5kbGVyc1tpXS5zdG9wKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHRoaXMucnVubmluZyA9IGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgYnVmZmVyKCkge1xyXG4gICAgcmV0dXJuIHRoaXMudHJhbnNwb3J0LmdldEJ1ZmZlcigpO1xyXG4gIH1cclxuXHJcbiAgc2VuZCgpIHtcclxuICAgIHJldHVybiB0aGlzLnRyYW5zcG9ydC5zZW5kLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcbiAgfVxyXG5cclxuICBzZXRIZWFkZXIoKSB7XHJcbiAgICByZXR1cm4gdGhpcy50cmFuc3BvcnQuc2V0SGVhZGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcbiAgfVxyXG5cclxuICBzZXRVcmwoKSB7XHJcbiAgICByZXR1cm4gdGhpcy50cmFuc3BvcnQuc2V0VXJsLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcbiAgfVxyXG5cclxuICBzZXRTZXNzaW9uSUQoKSB7XHJcbiAgICByZXR1cm4gdGhpcy50cmFuc3BvcnQuc2V0U2Vzc2lvbklELmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcbiAgfVxyXG5cclxuICBtYXJrKHRleHQpIHtcclxuICAgIGlmICh0aGlzLm1hcmtlckhhbmRsZXIpIHtcclxuICAgICAgdGhpcy5tYXJrZXJIYW5kbGVyLnRyaWdnZXIodGV4dCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxufTtcclxuXHJcbi8qKlxyXG4gKiBFeHBvc2UgQ0lUcmFwXHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBDSVRyYXA7XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2luZGV4LmpzIiwiXHJcbnZhclxyXG4gIGlkbGVUaW1lcixcclxuICBlcG9jaFRzLCBsYXN0VHM7XHJcblxyXG5jbGFzcyBTdGF0ZSB7XHJcbiAgY29uc3RydWN0b3Iod2luZG93LCB0cmFuc3BvcnQsIGlkbGVUaW1lb3V0KSB7XHJcbiAgICB0aGlzLndpbmRvdyA9IHdpbmRvdyxcclxuICAgIHRoaXMudHJhbnNwb3J0ID0gdHJhbnNwb3J0LFxyXG4gICAgdGhpcy5pZGxlVGltZW91dCA9IGlkbGVUaW1lb3V0O1xyXG5cclxuXHJcbiAgICB0aGlzLmdldERUID0gdGhpcy5nZXREVC5iaW5kKHRoaXMpO1xyXG4gICAgdGhpcy5pZGxlSGFuZGxlciA9IHRoaXMuaWRsZUhhbmRsZXIuYmluZCh0aGlzKTtcclxuXHJcbiAgICBpZiAoaWRsZVRpbWVvdXQgIT09IDApIHtcclxuICAgICAgdGhpcy5pZGxlSGFuZGxlcigpO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgfVxyXG4gIFxyXG4gIGlkbGVIYW5kbGVyKCkge1xyXG4gICAgdGhpcy50cmFuc3BvcnQuc2VuZCgpO1xyXG4gICAgaWRsZVRpbWVyID0gbnVsbDtcclxuICB9XHJcblxyXG4gIC8qXHJcbiAgICogUmV0dXJucyBhIHN0YWJsZSB0aW1lIGRpZmZlcmVuY2UgKGJldHdlZW4gZXZlbnRzLCBldmVuIGlmIGV2ZW50IGRvZXMgbm90XHJcbiAgICogc3VwcG9ydCBldmVudC50aW1lU3RhbXApLlxyXG4gICAqXHJcbiAgICogRXhhbXBsZXM6XHJcbiAgICogICAgICAgICAgICAgICAgICAwIC0tIGZpcmVmb3ggd2luZG93IHJlc2l6ZSAvIHNjcm9sbFxyXG4gICAqICAgICAgICAgIDE2MTI2MjQwMCAtLSBmaXJlZm94IG1vdXNlIG1vdmVcclxuICAgKiAgICAgICAgIDE0MDkwOTYxMzYgLS0gdGltZXN0YW1wIHNlY1xyXG4gICAqICAgICAgICAgMjAwMDAwMDAwMCAtLSB0aW1lc3RhbXAgc2VjIGJvdW5kYXJ5XHJcbiAgICogICAgICAxNDA5MDk1NzcwNzEzIC0tIGNocm9tZSBhbGxcclxuICAgKiAgICAgIDE0MDkwOTY4Mzg3MTcgLS0gZmlyZWZveCAobmV3IERhdGUoKSkuZ2V0VGltZSgpXHJcbiAgICogICAxMDAwMDAwMDAwMDAwMDAwIC0tIHRpbWVzdGFtcCBtaWNybyBib3VuZGFyeVxyXG4gICAqICAgMTQwOTA5NjQyNDM2NDE0OSAtLSBmaXJlZm94IGN1c3RvbSBldmVudFxyXG4gICAqL1xyXG4gIGdldERUKGV2ZW50LCBiaXRzKSB7XHJcblxyXG4gICAgdmFyXHJcbiAgICAgIHJvdW5kID0gTWF0aC5yb3VuZCxcclxuICAgICAgY3VycmVudFRzID0gZXZlbnQgJiYgdHlwZW9mIGV2ZW50LnRpbWVTdGFtcCA9PT0gXCJudW1iZXJcIiAmJiBldmVudC50aW1lU3RhbXAgfHwgKG5ldyBEYXRlKCkpLmdldFRpbWUoKSxcclxuICAgICAgZFQ7XHJcblxyXG4gICAgaWYgKGlkbGVUaW1lcikge1xyXG4gICAgICB0aGlzLndpbmRvdy5jbGVhclRpbWVvdXQoaWRsZVRpbWVyKTtcclxuICAgICAgaWRsZVRpbWVyID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoY3VycmVudFRzID4gMTAwMDAwMDAwMDAwMDAwMCkgeyAvLyAobWljcm9zZWNvbmRzKSBpbiBGaXJlZm94LCBzcGVjaWFsIGV2ZW50c1xyXG4gICAgICBjdXJyZW50VHMgPSByb3VuZChjdXJyZW50VHMgLyAxMDAwKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoY3VycmVudFRzIDwgMjAwMDAwMDAwMCkgeyAvLyAobWlsbGlzZWNvbmRzKSBpdCdzIEZpcmVmb3g7IHRha2UgY2FyZVxyXG4gICAgICBpZiAoIWVwb2NoVHMpIHtcclxuICAgICAgICBlcG9jaFRzID0gKG5ldyBEYXRlKCkpLmdldFRpbWUoKSAtIGN1cnJlbnRUcztcclxuICAgICAgfVxyXG4gICAgICBpZiAobGFzdFRzKSB7XHJcbiAgICAgICAgZFQgPSAoY3VycmVudFRzICsgZXBvY2hUcykgLSBsYXN0VHM7XHJcbiAgICAgIH1cclxuICAgICAgbGFzdFRzID0gKGN1cnJlbnRUcyArIGVwb2NoVHMpO1xyXG4gICAgfSBlbHNlIHsgICAgICAgICAgICAgICAgICAgICAgLy8gKG1pbGxpc2Vjb25kcykgZXZlcnl0aGluZyBlbHNlXHJcbiAgICAgIGlmIChsYXN0VHMpIHtcclxuICAgICAgICBkVCA9IGN1cnJlbnRUcyAtIGxhc3RUcztcclxuICAgICAgfVxyXG4gICAgICBsYXN0VHMgPSBjdXJyZW50VHM7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gdmFyIGRUMSA9IGRUO1xyXG5cclxuICAgIGlmIChkVCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgIHJldHVybiAwO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLmlkbGVUaW1lb3V0ICE9PSAwKSB7XHJcbiAgICAgIGlkbGVUaW1lciA9IHRoaXMud2luZG93LnNldFRpbWVvdXQodGhpcy5pZGxlSGFuZGxlciwgdGhpcy5pZGxlVGltZW91dCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGJpdHMpIHtcclxuICAgICAgdmFyIG1heCA9ICgxIDw8IGJpdHMpIC0gMTtcclxuICAgICAgZFQgPSBkVCA+IG1heCA/IG1heCA6IGRUO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFRPRE8gd2Ugc2hvdWxkIGNvcnJlY3Qgc3luYyAod2hlbiBkVCA8IDApXHJcbiAgICAvLyBpZiAoZFQgPCAwKSB7IC8vIHdlIGNhbiBjb3JyZWN0IHN5bmNcclxuICAgIC8vICAgZXBvY2hUcyA9IGVwb2NoVHMgKyBkVDtcclxuICAgIC8vICAgbGFzdFRzICA9IGxhc3RUcyArIGRUO1xyXG4gICAgLy8gICBkVCA9IDA7XHJcbiAgICAvLyB9XHJcbiAgICAvLyBjb25zb2xlLmxvZyhkVDEsIGRULCBkVDEgIT09IGRUICYmIFwiLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cIik7XHJcblxyXG4gICAgcmV0dXJuIGRUO1xyXG4gIH07XHJcblxyXG5sYXN0VHMgKCkge1xyXG4gIHJldHVybiBsYXN0VHM7XHJcbn07XHJcblxyXG5zdGFydCgpIHtcclxuICAvLyBub29wXHJcbn07XHJcblxyXG5zdG9wKCkge1xyXG4gIGxhc3RUcyA9IG51bGw7XHJcbn07XHJcblxyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFN0YXRlO1xyXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvc3RhdGUuanMiLCJ2YXJcclxuICBldmVudE5hbWUgPSBcImN0OnN0YXRlXCI7XHJcblxyXG5jbGFzcyBTdGF0ZUhhbmRsZXIge1xyXG4gIGNvbnN0cnVjdG9yKHdpbmRvdywgZG9jdW1lbnQsIGVsZW1lbnQsIHN0YXRlLCBidWZmZXIpIHtcclxuICAgIHRoaXMud2luZG93ID0gd2luZG93LFxyXG4gICAgICB0aGlzLmRvY3VtZW50ID0gZG9jdW1lbnQsXHJcbiAgICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQsXHJcbiAgICAgIHRoaXMuc3RhdGUgPSBzdGF0ZSxcclxuICAgICAgdGhpcy5idWZmZXIgPSBidWZmZXI7XHJcblxyXG4gICAgICB0aGlzLmhhbmRsZXIgPSB0aGlzLmhhbmRsZXIuYmluZCh0aGlzKTtcclxuICB9XHJcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG5cclxuICAvKlxyXG4gICAqIFN0YXRlIGV2ZW50IGhhbmRsZXIuXHJcbiAgICovXHJcbiAgaGFuZGxlcihldmVudCkge1xyXG4gICAgdmFyXHJcbiAgICAgIGRUID0gdGhpcy5zdGF0ZS5nZXREVChldmVudCwgMjApO1xyXG5cclxuICAgIHRoaXMuYnVmZmVyLnB1c2goWzE1LCBkVCwgdGhpcy5zdGF0ZS5sYXN0VHMoKSwgICAgICAgICAgICAgICAgICAgICAgLy8gMGIxMTExIDx0aW1lLWRpZmZlcmVuY2U6MjBiPiA8Y3VycmVudC10aW1lLXN0YW1wOjQyYj5cclxuICAgICAgdGhpcy5zdGF0ZS5tb3VzZVNjcmVlblgsIHRoaXMuc3RhdGUubW91c2VTY3JlZW5ZLCAgICAgIC8vIDxtb3VzZS1zY3JlZW4teDoxOGI+IDxtb3VzZS1zY3JlZW4teToxOGI+XHJcbiAgICAgIC8vc3RhdGUuY1gsIHN0YXRlLmNZLCAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gPG1vdXNlLWNsaWVudC14OjE4Yj4gPG1vdXNlLWNsaWVudC15OjE4Yj5cclxuICAgICAgdGhpcy5zdGF0ZS5wYWdlU2Nyb2xsWCwgdGhpcy5zdGF0ZS5wYWdlU2Nyb2xsWSwgICAgICAgIC8vIDxwYWdlLXNjcm9sbC14KGxlZnQpOjE4Yj4gPHBhZ2Utc2Nyb2xsLXkodG9wKToxOGI+XHJcbiAgICAgIHRoaXMud2luZG93LmlubmVyV2lkdGgsIHRoaXMud2luZG93LmlubmVySGVpZ2h0LCAgICAgICAvLyA8aW5uZXItd2luZG93LXdpZHRoOjE4Yj4gPGlubmVyLXdpbmRvdy1oZWlnaHQ6MThiPlxyXG4gICAgICB0aGlzLndpbmRvdy5vdXRlcldpZHRoLCB0aGlzLndpbmRvdy5vdXRlckhlaWdodCwgICAgICAgLy8gPG91dGVyLXdpbmRvdy13aWR0aDoxOGI+IDxvdXRlci13aW5kb3ctaGVpZ2h0OjE4Yj5cclxuICAgICAgdGhpcy53aW5kb3cuc2NyZWVuWCB8fCB0aGlzLndpbmRvdy5zY3JlZW5MZWZ0LCAgICAgICAgIC8vIDx3aW5kb3ctcG9zaXRpb24tbGVmdDoxOGI+XHJcbiAgICAgIHRoaXMud2luZG93LnNjcmVlblkgfHwgdGhpcy53aW5kb3cuc2NyZWVuVG9wLCAgICAgICAgICAvLyA8d2luZG93LXBvc2l0aW9uLXRvcDoxOGI+XHJcbiAgICAgIHRoaXMud2luZG93LnNjcmVlbi53aWR0aCwgdGhpcy53aW5kb3cuc2NyZWVuLmhlaWdodCAgICAvLyA8c2NyZWVuLXdpZHRoOjE4Yj4gPHNjcmVlbi1oZWlnaHQ6MThiPlxyXG4gICAgXSxcclxuICAgICAgWzQsIDIwLCA0MixcclxuICAgICAgICAxOCwgMTgsIC8vIDE4LCAxOCxcclxuICAgICAgICAxOCwgMTgsIDE4LCAxOCxcclxuICAgICAgICAxOCwgMTgsIDE4LCAxOCxcclxuICAgICAgICAxOCwgMThdKTtcclxuICB9O1xyXG5cclxuICB0cmlnZ2VyKCkge1xyXG4gICAgdmFyIHN0YXRlRXZlbnQgPSB0aGlzLmRvY3VtZW50LmNyZWF0ZUV2ZW50KFwiQ3VzdG9tRXZlbnRcIik7XHJcbiAgICBzdGF0ZUV2ZW50LmluaXRFdmVudChldmVudE5hbWUsIHRydWUsIGZhbHNlKTtcclxuICAgIHRoaXMuZWxlbWVudC5kaXNwYXRjaEV2ZW50KHN0YXRlRXZlbnQpO1xyXG4gIH07XHJcblxyXG4gIHN0YXJ0KG9wdGlvbnMpIHtcclxuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgdGhpcy5oYW5kbGVyLCBmYWxzZSk7XHJcbiAgICBpZiAob3B0aW9ucy5pbml0aWFsU3RhdGUgPT09IHRydWUpIHtcclxuICAgICAgdHJpZ2dlcigpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHN0b3AoKSB7XHJcbiAgICB0aGlzLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIHRoaXMuaGFuZGxlcik7XHJcbiAgfTtcclxuXHJcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBTdGF0ZUhhbmRsZXI7XHJcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9zdGF0ZWhhbmRsZXIuanMiLCIvLyBUT0RPOiBzYXZlIHRvdWNoU2NyZWVuWC9ZIHZhbHVlcyBpbnRvIHN0YXRlXHJcbi8vIFRPRE86IHNpbXBsaWZ5IC8gZ3JvdXAgc3RhcnQvZW5kL21vdmUgaGFuZGxlcnMsIHRoZXkgYXJlIG5lYXJseSBpZGVudGljYWxcclxudmFyXHJcbiAgc3RhcnRFdmVudE5hbWUgPSBcInRvdWNoc3RhcnRcIixcclxuICBlbmRFdmVudE5hbWUgPSBcInRvdWNoZW5kXCIsXHJcbiAgbW92ZUV2ZW50TmFtZSA9IFwidG91Y2htb3ZlXCIsXHJcblxyXG4gIHRvdWNoSWRUb0lkID0gW107XHJcblxyXG5jbGFzcyBUb3VjaEhhbmRsZXIge1xyXG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQsIHN0YXRlLCBidWZmZXIpIHtcclxuICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQsXHJcbiAgICAgIHRoaXMuc3RhdGUgPSBzdGF0ZSxcclxuICAgICAgdGhpcy5idWZmZXIgPSBidWZmZXI7XHJcblxyXG4gICAgICB0aGlzLnN0YXJ0SGFuZGxlciA9IHRoaXMuc3RhcnRIYW5kbGVyLmJpbmQodGhpcyk7XHJcbiAgICAgIHRoaXMubW92ZUhhbmRsZXIgPSB0aGlzLm1vdmVIYW5kbGVyLmJpbmQodGhpcyk7XHJcbiAgICAgIHRoaXMuZW5kSGFuZGxlciA9IHRoaXMuZW5kSGFuZGxlci5iaW5kKHRoaXMpO1xyXG4gIH1cclxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcblxyXG5cclxuICAvLyBmaW5kcyBhbiBleGlzdGluZyAob3IgZnJlZSkgaWQgZm9yIGdpdmVuIHRvdWNoSWQsIHN0YXJ0aW5nIGZyb20gMC5cclxuICByZXNvbHZlSWQodG91Y2hJZCkge1xyXG4gICAgdmFyXHJcbiAgICAgIGZpcnN0RnJlZSxcclxuICAgICAgbGVuZ3RoID0gdG91Y2hJZFRvSWQubGVuZ3RoLFxyXG4gICAgICBpID0gMDtcclxuICAgIGZvciAoOyBpIDwgbGVuZ3RoOyBpKyspIHtcclxuICAgICAgaWYgKHRvdWNoSWRUb0lkW2ldID09PSB0b3VjaElkKSB7IHJldHVybiBpOyB9XHJcbiAgICAgIGlmICh0b3VjaElkVG9JZFtpXSA9PT0gdW5kZWZpbmVkKSB7IGZpcnN0RnJlZSA9IGZpcnN0RnJlZSB8fCBpOyB9XHJcbiAgICB9XHJcbiAgICBpZiAodHlwZW9mIGZpcnN0RnJlZSA9PT0gXCJudW1iZXJcIikge1xyXG4gICAgICB0b3VjaElkVG9JZFtmaXJzdEZyZWVdID0gdG91Y2hJZDtcclxuICAgICAgcmV0dXJuIGZpcnN0RnJlZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRvdWNoSWRUb0lkLnB1c2godG91Y2hJZCk7XHJcbiAgICAgIHJldHVybiBsZW5ndGg7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgLy8gcmVtb3ZlcyB0b3VjaElkIGZyb20gbGlzdC5cclxuICByZW1vdmVJZCh0b3VjaElkKSB7XHJcbiAgICB2YXIgbGVuZ3RoID0gdG91Y2hJZFRvSWQubGVuZ3RoLCBpID0gMDtcclxuICAgIGZvciAoOyBpIDwgbGVuZ3RoOyBpKyspIHtcclxuICAgICAgaWYgKHRvdWNoSWRUb0lkW2ldID09PSB0b3VjaElkKSB7IHRvdWNoSWRUb0lkW2ldID0gdW5kZWZpbmVkOyB9XHJcbiAgICB9XHJcbiAgICBpLS07XHJcbiAgICBmb3IgKDsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgaWYgKHRvdWNoSWRUb0lkW2ldID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICB0b3VjaElkVG9JZC5wb3AoKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHN0YXJ0SGFuZGxlcihldmVudCkge1xyXG4gICAgdmFyXHJcbiAgICAgIGRUID0gdGhpcy5zdGF0ZS5nZXREVChldmVudCwgMjApLFxyXG4gICAgICBjaGFuZ2VkVG91Y2hlcyA9IGV2ZW50LmNoYW5nZWRUb3VjaGVzLFxyXG4gICAgICBsZW5ndGggPSBjaGFuZ2VkVG91Y2hlcy5sZW5ndGgsXHJcbiAgICAgIGkgPSAwO1xyXG5cclxuICAgIGZvciAoOyBpIDwgbGVuZ3RoOyBpKyspIHtcclxuICAgICAgdmFyXHJcbiAgICAgICAgZXYgPSBjaGFuZ2VkVG91Y2hlc1tpXSxcclxuICAgICAgICBpZCA9IHJlc29sdmVJZChldi5pZGVudGlmaWVyKTtcclxuICAgICAgICB0aGlzLmJ1ZmZlci5wdXNoKFszLCBkVCwgMSwgaWQsIGV2LnNjcmVlblgsIGV2LnNjcmVlblldLFxyXG4gICAgICAgIFs0LCAyMCwgMSwgNSwgMTgsIDE4XSk7XHJcbiAgICAgIGRUID0gMDsgLy8gbmV4dFxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH07XHJcblxyXG4gIGVuZEhhbmRsZXIoZXZlbnQpIHtcclxuICAgIHZhclxyXG4gICAgICBkVCA9IHRoaXMuc3RhdGUuZ2V0RFQoZXZlbnQsIDIwKSxcclxuICAgICAgY2hhbmdlZFRvdWNoZXMgPSBldmVudC5jaGFuZ2VkVG91Y2hlcyxcclxuICAgICAgbGVuZ3RoID0gY2hhbmdlZFRvdWNoZXMubGVuZ3RoLFxyXG4gICAgICBpID0gMDtcclxuXHJcbiAgICBmb3IgKDsgaSA8IGxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIHZhclxyXG4gICAgICAgIGV2ID0gY2hhbmdlZFRvdWNoZXNbaV0sXHJcbiAgICAgICAgaWQgPSByZXNvbHZlSWQoZXYuaWRlbnRpZmllcik7XHJcbiAgICAgICAgdGhpcy5idWZmZXIucHVzaChbMywgZFQsIDAsIGlkLCBldi5zY3JlZW5YLCBldi5zY3JlZW5ZXSxcclxuICAgICAgICBbNCwgMjAsIDEsIDUsIDE4LCAxOF0pO1xyXG5cclxuICAgICAgcmVtb3ZlSWQoZXYuaWRlbnRpZmllcik7XHJcblxyXG4gICAgICBkVCA9IDA7IC8vIG5leHRcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9O1xyXG5cclxuICBtb3ZlSGFuZGxlcihldmVudCkge1xyXG4gICAgdmFyXHJcbiAgICAgIGRUID0gdGhpcy5zdGF0ZS5nZXREVChldmVudCwgMjApLFxyXG4gICAgICBjaGFuZ2VkVG91Y2hlcyA9IGV2ZW50LmNoYW5nZWRUb3VjaGVzLFxyXG4gICAgICBsZW5ndGggPSBjaGFuZ2VkVG91Y2hlcy5sZW5ndGgsXHJcbiAgICAgIGkgPSAwO1xyXG5cclxuICAgIGZvciAoOyBpIDwgbGVuZ3RoOyBpKyspIHtcclxuICAgICAgdmFyXHJcbiAgICAgICAgZXYgPSBjaGFuZ2VkVG91Y2hlc1tpXSxcclxuICAgICAgICBpZCA9IHJlc29sdmVJZChldi5pZGVudGlmaWVyKTtcclxuICAgICAgICB0aGlzLmJ1ZmZlci5wdXNoKFsxLCBkVCwgMCwgaWQsIGV2LnNjcmVlblgsIGV2LnNjcmVlblldLFxyXG4gICAgICAgIFs0LCAyMCwgMSwgNSwgMTgsIDE4XSk7XHJcbiAgICAgIGRUID0gMDsgLy8gbmV4dFxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH07XHJcblxyXG4gIHN0YXJ0KCkge1xyXG4gICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoc3RhcnRFdmVudE5hbWUsIHRoaXMuc3RhcnRIYW5kbGVyKTtcclxuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKG1vdmVFdmVudE5hbWUsIHRoaXMubW92ZUhhbmRsZXIpO1xyXG4gICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZW5kRXZlbnROYW1lLCB0aGlzLmVuZEhhbmRsZXIpO1xyXG4gIH07XHJcblxyXG4gIHN0b3AoKSB7XHJcbiAgICB0aGlzLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihzdGFydEV2ZW50TmFtZSwgdGhpcy5zdGFydEhhbmRsZXIpO1xyXG4gICAgdGhpcy5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIobW92ZUV2ZW50TmFtZSwgdGhpcy5tb3ZlSGFuZGxlcik7XHJcbiAgICB0aGlzLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihlbmRFdmVudE5hbWUsIHRoaXMuZW5kSGFuZGxlcik7XHJcbiAgfTtcclxuXHJcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBUb3VjaEhhbmRsZXI7XHJcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy90b3VjaEhhbmRsZXIuanMiLCJ2YXJcclxuICBldmVudE5hbWUgPSBcImN0Om1hcmtcIixcclxuICBkZWZhdWx0VGV4dCA9IFwibWFya2VyXCI7XHJcblxyXG5jbGFzcyBNYXJrZXJIYW5kbGVyIHtcclxuICBjb25zdHJ1Y3Rvcih3aW5kb3csIGRvY3VtZW50LCBlbGVtZW50LCBzdGF0ZSwgYnVmZmVyKSB7XHJcbiAgICB0aGlzLndpbmRvdyA9IHdpbmRvdyxcclxuICAgICAgdGhpcy5kb2N1bWVudCA9IGRvY3VtZW50LFxyXG4gICAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50LFxyXG4gICAgICB0aGlzLnN0YXRlID0gc3RhdGUsXHJcbiAgICAgIHRoaXMuYnVmZmVyID0gYnVmZmVyO1xyXG5cclxuICAgICAgdGhpcy5oYW5kbGVyID0gdGhpcy5oYW5kbGVyLmJpbmQodGhpcyk7XHJcbiAgfVxyXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAvKlxyXG4gICAqIE1hcmtlciBldmVudCBuYW1lIChjb25zdGFudCkuXHJcbiAgICovXHJcblxyXG4gIGhhbmRsZXIoZXZlbnQpIHtcclxuICAgIHZhclxyXG4gICAgICBkVCA9IHRoaXMuc3RhdGUuZ2V0RFQoZXZlbnQsIDIwKSxcclxuICAgICAgdGV4dCA9IGV2ZW50ICYmIGV2ZW50LnRleHQgfHwgZGVmYXVsdFRleHQ7XHJcblxyXG4gICAgdGhpcy5idWZmZXIucHVzaChbMTQsIGRUXSxcclxuICAgICAgWzQsIDIwXSk7XHJcbiAgICB0aGlzLmJ1ZmZlci5wdXNoUmF3Qnl0ZXModGV4dCk7XHJcbiAgfTtcclxuXHJcbiAgdHJpZ2dlcih0ZXh0KSB7XHJcbiAgICB2YXIgbWFya0V2ZW50ID0gdGhpcy5kb2N1bWVudC5jcmVhdGVFdmVudChcIkN1c3RvbUV2ZW50XCIpO1xyXG4gICAgbWFya0V2ZW50LmluaXRFdmVudChldmVudE5hbWUsIHRydWUsIGZhbHNlKTtcclxuICAgIG1hcmtFdmVudC50ZXh0ID0gdGV4dCB8fCBcIm1hcmtcIjtcclxuICAgIHRoaXMuZWxlbWVudC5kaXNwYXRjaEV2ZW50KG1hcmtFdmVudCk7XHJcbiAgfTtcclxuXHJcbiAgc3RhcnQoKSB7XHJcbiAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIHRoaXMuaGFuZGxlciwgZmFsc2UpO1xyXG4gIH07XHJcblxyXG4gIHN0b3AoKSB7XHJcbiAgICB0aGlzLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIHRoaXMuaGFuZGxlcik7XHJcbiAgfTtcclxuXHJcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IE1hcmtlckhhbmRsZXI7XHJcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9tYXJrZXJIYW5kbGVyLmpzIiwidmFyXHJcbiAgLy8gYWJzID0gTWF0aC5hYnMsXHJcbiAgZXZlbnROYW1lID0gXCJtb3VzZW1vdmVcIjtcclxuXHJcbi8vIFRPRE86IGh0dHA6Ly93d3cuamFja2xtb29yZS5jb20vbm90ZXMvbW91c2UtcG9zaXRpb24vXHJcblxyXG5jbGFzcyBNb3VzZU1vdmVIYW5kbGVyIHtcclxuICBjb25zdHJ1Y3RvcihlbGVtZW50LCBzdGF0ZSwgYnVmZmVyKSB7XHJcbiAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50LFxyXG4gICAgICB0aGlzLnN0YXRlID0gc3RhdGUsXHJcbiAgICAgIHRoaXMuYnVmZmVyID0gYnVmZmVyO1xyXG5cclxuICAgICAgdGhpcy5oYW5kbGVyID0gdGhpcy5oYW5kbGVyLmJpbmQodGhpcyk7XHJcbiAgfVxyXG5cclxuICBoYW5kbGVyKGV2ZW50KSB7XHJcbiAgICB2YXJcclxuICAgICAgZFQgPSB0aGlzLnN0YXRlLmdldERUKGV2ZW50LCAyMCksXHJcbiAgICAgIHNYID0gZXZlbnQuc2NyZWVuWCxcclxuICAgICAgc1kgPSBldmVudC5zY3JlZW5ZO1xyXG5cclxuICAgIC8vIFNhdmluZyBmb3IgbmV4dCBjaGVja1xyXG4gICAgdGhpcy5zdGF0ZS5tb3VzZVNjcmVlblggPSBzWDtcclxuICAgIHRoaXMuc3RhdGUubW91c2VTY3JlZW5ZID0gc1k7XHJcblxyXG4gICAgdGhpcy5idWZmZXIucHVzaChbMCwgZFQsIHNYLCBzWV0sXHJcbiAgICAgIFs0LCAyMCwgMTgsIDE4XSk7XHJcblxyXG4gICAgLy8gU2F2aW5nIGZvciBtYXJrZXJzIC0tIHRlbXBvcmFyaWx5IGRpc2FibGVkXHJcbiAgICAvLyBzdGF0ZS5jWCA9IGV2ZW50LmNsaWVudFg7XHJcbiAgICAvLyBzdGF0ZS5jWSA9IGV2ZW50LmNsaWVudFk7XHJcbiAgICAvLyBidWZmZXIucHVzaChbMCwgZFQsIHNYLCBzWSwgZXZlbnQuY2xpZW50WCwgZXZlbnQuY2xpZW50WV0sXHJcbiAgICAvLyAgICAgICAgICAgICBbNCwgMjAsIDE4LCAxOCwgICAgICAgICAgICAxOCwgICAgICAgICAgICAxOF0pO1xyXG5cclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH07XHJcblxyXG4gIHN0YXJ0KCkge1xyXG5cclxuICAgIC8vIFRPRE86IFNvbWV0aGluZyBtb3JlIGFjY3VyYXRlIGlzIG5lZWRlZC5cclxuICAgIHRoaXMuc3RhdGUubW91c2VTY3JlZW5YID0gdGhpcy5zdGF0ZS5tb3VzZVNjcmVlblggfHwgMDtcclxuICAgIHRoaXMuc3RhdGUubW91c2VTY3JlZW5ZID0gdGhpcy5zdGF0ZS5tb3VzZVNjcmVlblkgfHwgMDtcclxuXHJcbiAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIHRoaXMuaGFuZGxlcik7XHJcbiAgfTtcclxuXHJcbiAgc3RvcCgpIHtcclxuICAgIHRoaXMuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgdGhpcy5oYW5kbGVyKTtcclxuICB9O1xyXG5cclxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IE1vdXNlTW92ZUhhbmRsZXI7XHJcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9tb3VzZU1vdmVIYW5kbGVyLmpzIiwidmFyXHJcbiAgZG93bkV2ZW50TmFtZSA9IFwibW91c2Vkb3duXCIsXHJcbiAgdXBFdmVudE5hbWUgPSBcIm1vdXNldXBcIjtcclxuXHJcbmNsYXNzIE1vdXNlQnV0dG9uSGFuZGxlciB7XHJcbiAgY29uc3RydWN0b3IoZWxlbWVudCwgc3RhdGUsIGJ1ZmZlcikge1xyXG4gICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudCxcclxuICAgICAgdGhpcy5zdGF0ZSA9IHN0YXRlLFxyXG4gICAgICB0aGlzLmJ1ZmZlciA9IGJ1ZmZlcjtcclxuXHJcbiAgICAgIHRoaXMuZG93bkhhbmRsZXIgPSB0aGlzLmRvd25IYW5kbGVyLmJpbmQodGhpcyk7XHJcbiAgICAgIHRoaXMudXBIYW5kbGVyID0gdGhpcy51cEhhbmRsZXIuYmluZCh0aGlzKTtcclxuICAgICAgXHJcbiAgfVxyXG5cclxuXHJcbiAgYnV0dG9uKGV2ZW50KSB7XHJcbiAgICB2YXIgYmIgPSBldmVudC53aGljaCB8fFxyXG4gICAgICBmdW5jdGlvbiAoYikge1xyXG4gICAgICAgIGlmIChiID09PSA0KSB7IHJldHVybiAyOyB9XHJcbiAgICAgICAgZWxzZSBpZiAoYiA9PT0gMikgeyByZXR1cm4gMzsgfVxyXG4gICAgICAgIGVsc2UgeyByZXR1cm4gMTsgfVxyXG4gICAgICB9KGV2ZW50LmJ1dHRvbik7XHJcbiAgICByZXR1cm4gYmI7XHJcbiAgfVxyXG5cclxuXHJcbiAgZG93bkhhbmRsZXIoZXZlbnQpIHtcclxuICAgIHZhciBkVCA9IHRoaXMuc3RhdGUuZ2V0RFQoZXZlbnQsIDIwKTtcclxuICAgIHZhciBzWCA9IGV2ZW50LnNjcmVlblgsXHJcbiAgICAgICAgc1kgPSBldmVudC5zY3JlZW5ZO1xyXG4gICAgdGhpcy5idWZmZXIucHVzaChbMiwgZFQsIHNYLCBzWSwgMCwgdGhpcy5idXR0b24oZXZlbnQpXSwgWzQsIDIwLCAxOCwgMTgsIDEsIDVdKTtcclxuICB9XHJcblxyXG4gIHVwSGFuZGxlcihldmVudCkge1xyXG4gICAgdmFyIGRUID0gdGhpcy5zdGF0ZS5nZXREVChldmVudCwgMjApO1xyXG4gICAgdmFyIHNYID0gZXZlbnQuc2NyZWVuWCxcclxuICAgICAgICBzWSA9IGV2ZW50LnNjcmVlblk7XHJcbiAgICB0aGlzLmJ1ZmZlci5wdXNoKFsyLCBkVCwgc1gsIHNZLCAwLCB0aGlzLmJ1dHRvbihldmVudCldLCBbNCwgMjAsIDE4LCAxOCwgMSwgNV0pO1xyXG4gIH1cclxuXHJcbiAgc3RhcnQoKSB7XHJcbiAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihkb3duRXZlbnROYW1lLCB0aGlzLmRvd25IYW5kbGVyKTtcclxuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKHVwRXZlbnROYW1lLCB0aGlzLnVwSGFuZGxlcik7XHJcbiAgfTtcclxuXHJcbiAgc3RvcCgpIHtcclxuICAgIHRoaXMuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGRvd25FdmVudE5hbWUsIHRoaXMuZG93bkhhbmRsZXIpO1xyXG4gICAgdGhpcy5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIodXBFdmVudE5hbWUsIHRoaXMudXBIYW5kbGVyKTtcclxuICB9O1xyXG5cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgTW91c2VCdXR0b25IYW5kbGVyO1xuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9tb3VzZUJ1dHRvbkhhbmRsZXIuanMiLCJ2YXJcclxuICBhYnMgPSBNYXRoLmFicyxcclxuICBldmVudE5hbWUgPSBcInNjcm9sbFwiO1xyXG5cclxuLy8gVE9ETyBzaW1wbGlmeS9jaGVjayB0aGlzIGhhbmRsZXJcclxuXHJcbmNsYXNzIFBhZ2VTY3JvbGxIYW5kbGVyIHtcclxuICBjb25zdHJ1Y3RvcihlbGVtZW50LCBzdGF0ZSwgYnVmZmVyKSB7XHJcbiAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50LFxyXG4gICAgICB0aGlzLnN0YXRlID0gc3RhdGUsXHJcbiAgICAgIHRoaXMuYnVmZmVyID0gYnVmZmVyO1xyXG5cclxuICAgICAgdGhpcy5oYW5kbGVyID0gdGhpcy5oYW5kbGVyLmJpbmQodGhpcyk7XHJcbiAgfVxyXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICBoYW5kbGVyKGV2ZW50KSB7XHJcblxyXG4gICAgdmFyXHJcbiAgICAgIHBYLCBwWSxcclxuICAgICAgZFgsIGRZLFxyXG4gICAgICBzaWduRFgsIHNpZ25EWSxcclxuICAgICAgYWJzRFgsIGFic0RZLFxyXG5cclxuICAgICAgZFQgPSB0aGlzLnN0YXRlLmdldERUKGV2ZW50LCAyMCk7XHJcblxyXG4gICAgLy8gU2Nyb2xsIFgvWSBvbiBjdXJyZW50IHBhZ2VcclxuICAgIGlmIChcInBhZ2VYT2Zmc2V0XCIgaW4gdGhpcy5lbGVtZW50ICYmIHRoaXMuZWxlbWVudC5kb2N1bWVudCkgeyAvLyBpdCdzIGEgd2luZG93LCBvciBsb29rcyBsaWtlIGEgd2luZG93XHJcbiAgICAgIHZhciBkb2MgPSB0aGlzLmVsZW1lbnQuZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xyXG4gICAgICBwWCA9ICh0aGlzLmVsZW1lbnQucGFnZVhPZmZzZXQgfHwgZG9jLnNjcm9sbExlZnQpIC0gKGRvYy5jbGllbnRMZWZ0IHx8IDApO1xyXG4gICAgICBwWSA9ICh0aGlzLmVsZW1lbnQucGFnZVlPZmZzZXQgfHwgZG9jLnNjcm9sbFRvcCkgLSAoZG9jLmNsaWVudFRvcCB8fCAwKTtcclxuICAgIH0gZWxzZSB7IC8vIGZhbGxiYWNrXHJcbiAgICAgIHBYID0gZXZlbnQucGFnZVg7XHJcbiAgICAgIHBZID0gZXZlbnQucGFnZVk7XHJcbiAgICB9XHJcblxyXG4gICAgZFggPSBwWCAtIHRoaXMuc3RhdGUucFg7XHJcbiAgICBzaWduRFggPSBkWCA8IDAgPyAxIDogMDtcclxuICAgIGFic0RYID0gYWJzKGRYKTtcclxuICAgIGRZID0gcFkgLSB0aGlzLnN0YXRlLnBZO1xyXG4gICAgc2lnbkRZID0gZFkgPCAwID8gMSA6IDA7XHJcbiAgICBhYnNEWSA9IGFicyhkWSk7XHJcblxyXG4gICAgdGhpcy5zdGF0ZS5wYWdlU2Nyb2xsWCA9IHBYO1xyXG4gICAgdGhpcy5zdGF0ZS5wYWdlU2Nyb2xsWSA9IHBZO1xyXG5cclxuICAgIHRoaXMuYnVmZmVyLnB1c2goWzQsIGRULCBzaWduRFgsIGFic0RYLCBzaWduRFksIGFic0RZXSxcclxuICAgICAgWzQsIDIwLCAxLCAxMSwgMSwgMTFdKTtcclxuXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9O1xyXG5cclxuICBzdGFydCgpIHtcclxuXHJcbiAgICAvLyBTY3JvbGwgWC9ZIG9uIGN1cnJlbnQgcGFnZVxyXG4gICAgaWYgKFwicGFnZVhPZmZzZXRcIiBpbiB0aGlzLmVsZW1lbnQgJiYgdGhpcy5lbGVtZW50LmRvY3VtZW50KSB7IC8vIGl0J3MgYSB3aW5kb3csIG9yIGxvb2tzIGxpa2UgYSB3aW5kb3dcclxuICAgICAgdmFyIGRvYyA9IHRoaXMuZWxlbWVudC5kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XHJcbiAgICAgIHRoaXMuc3RhdGUucGFnZVNjcm9sbFggPSAodGhpcy5lbGVtZW50LnBhZ2VYT2Zmc2V0IHx8IGRvYy5zY3JvbGxMZWZ0KSAtIChkb2MuY2xpZW50TGVmdCB8fCAwKTtcclxuICAgICAgdGhpcy5zdGF0ZS5wYWdlU2Nyb2xsWSA9ICh0aGlzLmVsZW1lbnQucGFnZVlPZmZzZXQgfHwgZG9jLnNjcm9sbFRvcCkgLSAoZG9jLmNsaWVudFRvcCB8fCAwKTtcclxuICAgIH0gZWxzZSB7IC8vIGZhbGxiYWNrXHJcbiAgICAgIHRoaXMuc3RhdGUucGFnZVNjcm9sbFggPSAwO1xyXG4gICAgICB0aGlzLnN0YXRlLnBhZ2VTY3JvbGxZID0gMDtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIHRoaXMuaGFuZGxlciwgZmFsc2UpO1xyXG4gIH07XHJcblxyXG4gIHN0b3AoKSB7XHJcbiAgICB0aGlzLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIHRoaXMuaGFuZGxlciwgZmFsc2UpO1xyXG4gIH07XHJcblxyXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgUGFnZVNjcm9sbEhhbmRsZXI7XHJcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9wYWdlU2Nyb2xsSGFuZGxlci5qcyIsInZhclxyXG4gIGRlbGF5ID0gMTAwMCAvIDE1LCAvLyAxNWZwc1xyXG4gIHRpbWVvdXQ7XHJcblxyXG5jbGFzcyBXaW5kb3dTaXplSGFuZGxlciB7XHJcbiAgY29uc3RydWN0b3Iod2luZG93LCBzdGF0ZSwgYnVmZmVyKSB7XHJcbiAgICB0aGlzLndpbmRvdyA9IHdpbmRvdyxcclxuICAgICAgdGhpcy5zdGF0ZSA9IHN0YXRlLFxyXG4gICAgICB0aGlzLmJ1ZmZlciA9IGJ1ZmZlcjtcclxuXHJcbiAgICAgIHRoaXMudGhyb3R0bGVyID0gdGhpcy50aHJvdHRsZXIuYmluZCh0aGlzKTtcclxuICB9XHJcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gIGhhbmRsZXIoZXZlbnQpIHtcclxuICAgIHZhclxyXG4gICAgICB3ID0gdGhpcy53aW5kb3cuaW5uZXJXaWR0aCxcclxuICAgICAgaCA9IHRoaXMud2luZG93LmlubmVySGVpZ2h0LFxyXG4gICAgICBkVCA9IHRoaXMuc3RhdGUuZ2V0RFQoZXZlbnQsIDIwKTtcclxuXHJcbiAgICAvLyB0eXBlID0gMGIxMDAwXHJcbiAgICB0aGlzLmJ1ZmZlci5wdXNoKFs4LCBkVCwgdywgaF0sXHJcbiAgICAgIFs0LCAyMCwgMTUsIDE1XSk7XHJcbiAgfTtcclxuXHJcbiAgdGhyb3R0bGVyKGV2ZW50KSB7XHJcbiAgICBpZiAodGhpcy50aW1lb3V0KSB7XHJcbiAgICAgIHRoaXMud2luZG93LmNsZWFyVGltZW91dCh0aGlzLnRpbWVvdXQoKSk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgdGltZW91dCgpe1xyXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICB0aW1lb3V0ID0gbnVsbDtcclxuICAgICAgc2VsZi5oYW5kbGVyKGV2ZW50KTtcclxuICAgIH0sIGRlbGF5KTtcclxuICB9XHJcblxyXG4gIHN0YXJ0KCkge1xyXG4gICAgdGhpcy5zdGF0ZS53VyA9IHRoaXMud2luZG93LmlubmVyV2lkdGg7XHJcbiAgICB0aGlzLnN0YXRlLndIID0gdGhpcy53aW5kb3cuaW5uZXJIZWlnaHQ7XHJcbiAgICB0aGlzLndpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsIHRoaXMudGhyb3R0bGVyLCBmYWxzZSk7XHJcbiAgfTtcclxuXHJcbiAgc3RvcCgpIHtcclxuICAgIHRoaXMud2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgdGhpcy50aHJvdHRsZXIsIGZhbHNlKTtcclxuICB9O1xyXG5cclxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFdpbmRvd1NpemVIYW5kbGVyO1xyXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvd2luZG93U2l6ZUhhbmRsZXIuanMiLCJ2YXJcclxuICBldmVudE5hbWUgPSBcInBvc2l0aW9uY2hhbmdlZFwiLFxyXG4gIGxvbmdEZWxheSA9IDEwMDAgLyAyLCAvLyAyZnBzXHJcbiAgc2hvcnREZWxheSA9IDEwMDAgLyAxNSwgLy8gMTVmcHNcclxuICB0aHJvdHRsZUJhc2UgPSAxNSwgLy8gaXQncyBhIFwiY29uc3RhbnRcIlxyXG4gIHRocm90dGxlQ291bnQgPSB0aHJvdHRsZUJhc2UsXHJcbiAgdGltZW91dDtcclxuXHJcbmNsYXNzIFdpbmRvd1Bvc2l0aW9uSGFuZGxlciB7XHJcbiAgY29uc3RydWN0b3Iod2luZG93LCBkb2N1bWVudCwgc3RhdGUsIGJ1ZmZlcikge1xyXG4gICAgdGhpcy53aW5kb3cgPSB3aW5kb3csXHJcbiAgICAgIHRoaXMuZG9jdW1lbnQgPSBkb2N1bWVudCxcclxuICAgICAgdGhpcy5zdGF0ZSA9IHN0YXRlLFxyXG4gICAgICB0aGlzLmJ1ZmZlciA9IGJ1ZmZlcjtcclxuXHJcbiAgICAgIHRoaXMuaGFuZGxlciA9IHRoaXMuaGFuZGxlci5iaW5kKHRoaXMpO1xyXG4gICAgICB0aGlzLnBvbGxlciA9IHRoaXMucG9sbGVyLmJpbmQodGhpcyk7XHJcbiAgfVxyXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuXHJcbiAgd2luZG93UG9zaXRpb25YKCkge1xyXG4gICAgcmV0dXJuIHRoaXMud2luZG93LnNjcmVlblggfHwgdGhpcy53aW5kb3cuc2NyZWVuTGVmdCB8fCAwO1xyXG4gIH07XHJcblxyXG4gIHdpbmRvd1Bvc2l0aW9uWSgpIHtcclxuICAgIHJldHVybiB0aGlzLndpbmRvdy5zY3JlZW5ZIHx8IHRoaXMud2luZG93LnNjcmVlblRvcCB8fCAwO1xyXG4gIH07XHJcblxyXG4gIGhhbmRsZXIoZXZlbnQpIHtcclxuICAgIHZhciBkVCA9IHRoaXMuc3RhdGUuZ2V0RFQobnVsbCwgMjApO1xyXG5cclxuICAgIHRoaXMuc3RhdGUud2luZG93UG9zaXRpb25YID0gZXZlbnQueDtcclxuICAgIHRoaXMuc3RhdGUud2luZG93UG9zaXRpb25ZID0gZXZlbnQueTtcclxuXHJcbiAgICAvLyB0eXBlID0gMGIxMDAxXHJcbiAgICB0aGlzLmJ1ZmZlci5wdXNoKFs5LCBkVCwgZXZlbnQueCwgZXZlbnQueV0sXHJcbiAgICAgIFs0LCAyMCwgMTUsIDE1XSk7XHJcbiAgfTtcclxuXHJcbiAgcG9sbGVyKCkge1xyXG4gICAgdmFyXHJcbiAgICAgIHggPSB0aGlzLndpbmRvd1Bvc2l0aW9uWCgpLFxyXG4gICAgICB5ID0gdGhpcy53aW5kb3dQb3NpdGlvblkoKTtcclxuXHJcbiAgICBpZiAodGhpcy5zdGF0ZS53aW5kb3dQb3NpdGlvblggIT09IHggfHwgdGhpcy5zdGF0ZS53aW5kb3dQb3NpdGlvblkgIT09IHkpIHtcclxuICAgICAgdmFyIGV2ZW50ID0gdGhpcy5kb2N1bWVudC5jcmVhdGVFdmVudChcIkN1c3RvbUV2ZW50XCIpO1xyXG4gICAgICBldmVudC5pbml0RXZlbnQoZXZlbnROYW1lLCB0cnVlLCBmYWxzZSk7XHJcbiAgICAgIGV2ZW50LnggPSB4O1xyXG4gICAgICBldmVudC55ID0geTtcclxuICAgICAgdGhpcy53aW5kb3cuZGlzcGF0Y2hFdmVudChldmVudCk7XHJcblxyXG4gICAgICB0aHJvdHRsZUNvdW50ID0gdGhyb3R0bGVCYXNlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aHJvdHRsZUNvdW50ID4gMCkge1xyXG4gICAgICB0aHJvdHRsZUNvdW50LS07XHJcbiAgICAgIHRpbWVvdXQgPSB0aGlzLndpbmRvdy5zZXRUaW1lb3V0KHRoaXMucG9sbGVyLCBzaG9ydERlbGF5KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRpbWVvdXQgPSB0aGlzLndpbmRvdy5zZXRUaW1lb3V0KHRoaXMucG9sbGVyLCBsb25nRGVsYXkpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHN0YXJ0UG9sbGVyKCkge1xyXG4gICAgdGhpcy53aW5kb3cuc2V0VGltZW91dCh0aGlzLnBvbGxlciwgbG9uZ0RlbGF5KTtcclxuICB9O1xyXG5cclxuICBzdG9wUG9sbGVyKCkge1xyXG4gICAgaWYgKHRpbWVvdXQpIHtcclxuICAgICAgdGhpcy53aW5kb3cuY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHN0YXJ0KCkge1xyXG4gICAgdGhpcy5zdGF0ZS53aW5kb3dQb3NpdGlvblggPSB0aGlzLndpbmRvd1Bvc2l0aW9uWCgpO1xyXG4gICAgdGhpcy5zdGF0ZS53aW5kb3dQb3NpdGlvblkgPSB0aGlzLndpbmRvd1Bvc2l0aW9uWSgpO1xyXG4gICAgdGhpcy53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIHRoaXMuaGFuZGxlciwgZmFsc2UpO1xyXG4gICAgdGhpcy5zdGFydFBvbGxlcigpO1xyXG4gIH07XHJcblxyXG4gIHN0b3AoKSB7XHJcbiAgICB0aGlzLnN0b3BQb2xsZXIoKTtcclxuICAgIHRoaXMud2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCB0aGlzLmhhbmRsZXIsIGZhbHNlKTtcclxuICB9O1xyXG5cclxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFdpbmRvd1Bvc2l0aW9uSGFuZGxlcjtcclxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3dpbmRvd1Bvc2l0aW9uSGFuZGxlci5qcyIsIlxyXG52YXJcclxuICBldmVudE5hbWUgPSBcImJlZm9yZXVubG9hZFwiO1xyXG5cclxuY2xhc3MgV2luZG93VW5sb2FkSGFuZGxlciB7XHJcbiAgY29uc3RydWN0b3Iod2luZG93LCBzdGF0ZSwgYnVmZmVyKSB7XHJcbiAgICB0aGlzLndpbmRvdyA9IHdpbmRvdyxcclxuICAgICAgdGhpcy5zdGF0ZSA9IHN0YXRlLFxyXG4gICAgICB0aGlzLmJ1ZmZlciA9IGJ1ZmZlcjtcclxuXHJcbiAgICB0aGlzLmhhbmRsZXIgPSB0aGlzLmhhbmRsZXIuYmluZCh0aGlzKTtcclxuICB9XHJcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG5cclxuXHJcbiAgaGFuZGxlcihldmVudCkge1xyXG4gICAgdmFyIGRUID0gdGhpcy5zdGF0ZS5nZXREVChldmVudCwgMjApO1xyXG5cclxuICAgIC8vIDBiMTAwMVxyXG4gICAgdGhpcy5idWZmZXIucHVzaChbMTIsIGRUXSxcclxuICAgICAgWzQsIDIwXSk7XHJcbiAgfTtcclxuXHJcbiAgc3RhcnQoKSB7XHJcbiAgICB0aGlzLndpbmRvdy5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgdGhpcy5oYW5kbGVyLCBmYWxzZSk7XHJcbiAgfTtcclxuXHJcbiAgc3RvcCgpIHtcclxuICAgIHRoaXMud2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCB0aGlzLmhhbmRsZXIsIGZhbHNlKTtcclxuICB9O1xyXG5cclxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFdpbmRvd1VubG9hZEhhbmRsZXI7XHJcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy93aW5kb3dVbmxvYWRIYW5kbGVyLmpzIiwidmFyXHJcbiAgc3RhdGVLZXksXHJcbiAgZXZlbnRLZXksXHJcblxyXG4gIGtleXMgPSB7XHJcbiAgICBoaWRkZW46IFwidmlzaWJpbGl0eWNoYW5nZVwiLFxyXG4gICAgd2Via2l0SGlkZGVuOiBcIndlYmtpdHZpc2liaWxpdHljaGFuZ2VcIixcclxuICAgIG1vekhpZGRlbjogXCJtb3p2aXNpYmlsaXR5Y2hhbmdlXCIsXHJcbiAgICBtc0hpZGRlbjogXCJtc3Zpc2liaWxpdHljaGFuZ2VcIlxyXG4gIH07XHJcblxyXG5jbGFzcyBWaXNpYmlsaXR5Q2hhbmdlSGFuZGxlciB7XHJcbiAgY29uc3RydWN0b3Iod2luZG93LCBzdGF0ZSwgYnVmZmVyKSB7XHJcbiAgICB0aGlzLndpbmRvdyA9IHdpbmRvdyxcclxuICAgICAgdGhpcy5zdGF0ZSA9IHN0YXRlLFxyXG4gICAgICB0aGlzLmJ1ZmZlciA9IGJ1ZmZlcjtcclxuXHJcbiAgICBmb3IgKHN0YXRlS2V5IGluIGtleXMpIHtcclxuICAgICAgaWYgKHN0YXRlS2V5IGluIHdpbmRvdy5kb2N1bWVudCkge1xyXG4gICAgICAgIGV2ZW50S2V5ID0ga2V5c1tzdGF0ZUtleV07XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmhhbmRsZXIgPSB0aGlzLmhhbmRsZXIuYmluZCh0aGlzKTtcclxuICB9XHJcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG5cclxuICBoYW5kbGVyKGV2ZW50KSB7XHJcbiAgICB2YXIgZFQgPSB0aGlzLnN0YXRlLmdldERUKGV2ZW50LCAyMCk7XHJcblxyXG4gICAgaWYgKHRoaXMud2luZG93LmRvY3VtZW50W3N0YXRlS2V5XSkgeyAvLyBpZGxlL2hpZGRlbiwgMGIxMDExXHJcbiAgICAgIHRoaXMuYnVmZmVyLnB1c2goWzExLCBkVF0sXHJcbiAgICAgICAgWzQsIDIwXSk7XHJcbiAgICB9IGVsc2UgeyAvLyBmb2N1c2VkL3Zpc2libGUsIDBiMTAxMFxyXG4gICAgICB0aGlzLmJ1ZmZlci5wdXNoKFsxMCwgZFRdLFxyXG4gICAgICAgIFs0LCAyMF0pO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHN0YXJ0KCkge1xyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnRLZXksIHRoaXMuaGFuZGxlciwgZmFsc2UpO1xyXG4gIH07XHJcblxyXG4gIHN0b3AoKSB7XHJcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudEtleSwgdGhpcy5oYW5kbGVyLCBmYWxzZSk7XHJcbiAgfTtcclxuXHJcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBWaXNpYmlsaXR5Q2hhbmdlSGFuZGxlcjtcclxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3Zpc2liaWxpdHlDaGFuZ2VIYW5kbGVyLmpzIiwidmFyIG1hcCA9IFwiQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrL1wiO1xyXG5cclxuLy8gQGNvbnN0YW50XHJcbnZhciBoZWFkID0gXCJCQlwiOyAvLyB2MiA6KVxyXG5cclxuLy8gYnVmZmVyXHJcblxyXG4vLyBMb2NhbHMuXHJcbnZhclxyXG4gIHVybCA9IFwiL3NcIixcclxuICBoZWFkZXJzID0ge30sXHJcbiAgY291bnRlciA9IDEsXHJcbiAgc2Vzc2lvbklEO1xyXG5cclxuY2xhc3MgVHJhbnNwb3J0IHtcclxuICBjb25zdHJ1Y3Rvcih3aW5kb3cpIHtcclxuICAgIHRoaXMud2luZG93ID0gd2luZG93LFxyXG4gICAgICB0aGlzLmVuY29kZVdyYXBwZXIgPSB3aW5kb3cuZW5jb2RlVVJJQ29tcG9uZW50O1xyXG4gICAgICB0aGlzLmJ1ZmZlciA9IFwiXCI7XHJcbiAgICB0aGlzLnNlbmQgPSB0aGlzLnNlbmQuYmluZCh0aGlzKTtcclxuICB9XHJcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gIC8vIEBjb25zdGFudFxyXG5cclxuXHJcbiAgZW5jb2RlVmFsdWVzKHZhbHVlcywgc2l6ZXMpIHtcclxuICAgIHZhciBpZHgsXHJcbiAgICAgIGxlbiA9IHZhbHVlcy5sZW5ndGgsXHJcbiAgICAgIGJjID0gMCwgLy8gYml0IGNvdW50ZXJcclxuICAgICAgY3YsIC8vIGN1cnJlbnQgdmFsdWVcclxuICAgICAgYXYgPSAwLCAvLyBhY3R1YWwgdmFsdWVcclxuICAgICAgc2l6ZSxcclxuICAgICAgcmVzdWx0cyA9IFwiXCI7XHJcblxyXG4gICAgZm9yIChpZHggPSAwOyBpZHggPCBsZW47IGlkeCsrKSB7XHJcbiAgICAgIGN2ID0gdmFsdWVzW2lkeF07XHJcbiAgICAgIHNpemUgPSBzaXplc1tpZHhdO1xyXG4gICAgICBpZiAoY3YgPCAwKSB7IGN2ID0gMDsgfVxyXG4gICAgICBpZiAoY3YgPiAoKDIgPDwgc2l6ZSkgLSAxKSkgeyBjdiA9ICgoMiA8PCBzaXplKSAtIDEpOyB9XHJcbiAgICAgIGlmIChhdiA+IDApIHtcclxuICAgICAgICBhdiA9IGF2IDw8IHNpemU7XHJcbiAgICAgIH1cclxuICAgICAgYXYgfD0gY3YgJiAoKDEgPDwgc2l6ZSkgLSAxKTtcclxuICAgICAgYmMgKz0gc2l6ZTtcclxuICAgICAgd2hpbGUgKGJjID4gNikge1xyXG4gICAgICAgIGJjIC09IDY7XHJcbiAgICAgICAgcmVzdWx0cyArPSBtYXBbYXYgPj4+IGJjXTtcclxuICAgICAgICBhdiAmPSAoMSA8PCBiYykgLSAxO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmVzdWx0cyArPSBtYXBbYXYgPDwgKDYgLSBiYyldO1xyXG5cclxuICAgIHJldHVybiByZXN1bHRzO1xyXG4gIH07XHJcblxyXG4gIGVuY29kZUhlYWRlcnMoaGVhZGVycykge1xyXG4gICAgdmFyIGhlYWRlclN0cmluZyA9IFwiXCI7XHJcblxyXG4gICAgZm9yICh2YXIga2V5IGluIGhlYWRlcnMpIHtcclxuICAgICAgaWYgKGhlYWRlcnMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xyXG4gICAgICAgIGhlYWRlclN0cmluZyA9IGhlYWRlclN0cmluZ1xyXG4gICAgICAgICAgKyB0aGlzLmVuY29kZVdyYXBwZXIoa2V5KSArIFwiPVwiXHJcbiAgICAgICAgICArIHRoaXMuZW5jb2RlV3JhcHBlcihoZWFkZXJzW2tleV0pICsgXCIsXCI7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcy5lbmNvZGVWYWx1ZXMoW2hlYWRlclN0cmluZy5sZW5ndGhdLCBbMTJdKSArIGhlYWRlclN0cmluZztcclxuICB9O1xyXG5cclxuICAvKlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICogUmVzZXRzIGJ1ZmZlci5cclxuICAgKi9cclxuICByZXNldCgpIHtcclxuICAgIHRoaXMuYnVmZmVyID0gXCJcIjtcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxuXHJcbiAgLypcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqIFNoaWZ0cyBhdmFpbGFibGUgZGF0YS4gIFRoYXQgbWVhbnMgcmVzZXR0aW5nIHRvIGl0cyBkZWZhdWx0cyBhbmQgcmV0dXJuaW5nXHJcbiAgICogYWxyZWFkeSBjb2xsZWN0ZWQgZXZlbnRzLlxyXG4gICAqL1xyXG4gIHNoaWZ0KCkge1xyXG4gICAgdmFyIGNvbnRlbnRzID0gdGhpcy5idWZmZXI7XHJcbiAgICB0aGlzLnJlc2V0KCk7XHJcbiAgICByZXR1cm4gY29udGVudHM7XHJcbiAgfVxyXG5cclxuICAvKlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICogRW5jb2RlcyByYXcgYnl0ZXMgaW50byBzdHJlYW0gZm9ybWF0IChsZW5ndGggKyBVUkkgZW5jb2RlZCBzdHJpbmdcclxuICAgKiByZXByZXNlbnRhdGlvbikuXHJcbiAgICovXHJcbiAgZW5jb2RlUmF3Qnl0ZXMoYnl0ZXMpIHtcclxuICAgIHZhciBlbmNvZGVkID0gdGhpcy5lbmNvZGVXcmFwcGVyKGJ5dGVzKTtcclxuICAgIHJldHVybiB0aGlzLmVuY29kZVZhbHVlcyhbZW5jb2RlZC5sZW5ndGhdLCBbMTJdKSArIGVuY29kZWQ7XHJcbiAgfVxyXG5cclxuICBzZW5kKHN5bmMsIGNhbGxiYWNrKSB7XHJcbiAgICB0cnkge1xyXG4gICAgICB2YXIgeCA9IG5ldyAodGhpcy53aW5kb3cuWE1MSHR0cFJlcXVlc3QgfHwgdGhpcy53aW5kb3cuQWN0aXZlWE9iamVjdCkoJ01TWE1MMi5YTUxIVFRQLjMuMCcpO1xyXG4gICAgICB4Lm9wZW4oJ1BPU1QnLCB1cmwsIDEpO1xyXG4gICAgICB4LnNldFJlcXVlc3RIZWFkZXIoJ1gtUmVxdWVzdGVkLVdpdGgnLCAnWE1MSHR0cFJlcXVlc3QnKTtcclxuICAgICAgeC5zZXRSZXF1ZXN0SGVhZGVyKCdDb250ZW50LXR5cGUnLCAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyk7XHJcbiAgICAgIHgub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmICgoeC5yZWFkeVN0YXRlID09PSA0KSAmJiAoeC5zdGF0dXMgPT09IDIwMCkpIHtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKFwic3VjY2Vzc1wiKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgY29uc29sZS5sb2coXCJmYWlsXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuXHJcbiAgICAgIHguc2VuZChoZWFkICsgdGhpcy5lbmNvZGVIZWFkZXJzKGhlYWRlcnMpICsgdGhpcy5zaGlmdCgpKVxyXG5cclxuICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgd2luZG93LmNvbnNvbGUgJiYgY29uc29sZS5sb2coZSk7XHJcbiAgICB9XHJcbiAgfTtcclxuICAvKipcclxuICAgKiBTZW5kcyBkYXRhIHRvIGRlc3RpbmF0aW9uLlxyXG4gICAqL1xyXG4gIC8vIHNlbmQoc3luYywgY2FsbGJhY2spIHtcclxuICAvLyAgIHZhclxyXG4gIC8vICAgICByZXEgPSBuZXcgd2luZG93LlhNTEh0dHBSZXF1ZXN0KCksXHJcbiAgLy8gICAgIG9uUmVzcG9uc2UgPSBmdW5jdGlvbiAoKSB7XHJcbiAgLy8gICAgICAgaWYgKGNhbGxiYWNrKSB7XHJcbiAgLy8gICAgICAgICBpZiAoKHJlcS5yZWFkeVN0YXRlID09PSA0KSAmJiAocmVxLnN0YXR1cyA9PT0gMjAwKSkge1xyXG4gIC8vICAgICAgICAgICBjYWxsYmFjayhyZXEpO1xyXG4gIC8vICAgICAgICAgfSBlbHNlIHtcclxuICAvLyAgICAgICAgICAgY29uc29sZS5sb2coXCJGYWlsdXJlXCIpXHJcbiAgLy8gICAgICAgICB9XHJcbiAgLy8gICAgICAgfVxyXG4gIC8vICAgICB9LFxyXG4gIC8vICAgICBvblN1Y2Nlc3MgPSBmdW5jdGlvbiAoKSB7IGNvbnNvbGUubG9nKFwic3VjY2Vzc1wiKSB9LCAvLyBUT0RPXHJcbiAgLy8gICAgIG9uRmFpbHVyZSA9IGZ1bmN0aW9uICgpIHsgY29uc29sZS5sb2coXCJGYWlsdXJlXCIpIH07IC8vIFRPRE9cclxuXHJcbiAgLy8gICAvLyBUT0RPIG1ha2UgaXQgY29uZmlndXJhYmxlIChlbmFibGUvZGlzYWJsZSkgdy8vb1xyXG4gIC8vICAgaGVhZGVyc1tcInN0cmVhbS1pZFwiXSA9IChzZXNzaW9uSUQgPyBzZXNzaW9uSUQgOiBcIlwiKSArIFwiLlwiICsgKGNvdW50ZXIrKyk7XHJcblxyXG4gIC8vICAgaWYgKFwid2l0aENyZWRlbnRpYWxzXCIgaW4gcmVxKSB7IC8vIElzIGl0IGEgcmVhbCBYTUxIdHRwUmVxdWVzdDIgb2JqZWN0XHJcbiAgLy8gICAgIHJlcS5vcGVuKFwiUE9TVFwiLCB1cmwsICFzeW5jKTtcclxuICAvLyAgICAgcmVxLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IG9uUmVzcG9uc2U7IC8vIFRPRE8gWE1MSHR0cFJlcXVlc3QyIGhhcyBvbmxvYWQgYW5kIGNvLi4uXHJcbiAgLy8gICAgIHJlcS5zZXRSZXF1ZXN0SGVhZGVyKFwiQ29udGVudC10eXBlXCIsIFwidGV4dC9wbGFpblwiKTtcclxuICAvLyAgICAgLy8gcmVxLndpdGhDcmVkZW50aWFscyA9IHRydWU7XHJcbiAgLy8gICB9IGVsc2UgaWYgKHR5cGVvZiB0aGlzLndpbmRvdy5YRG9tYWluUmVxdWVzdCAhPT0gXCJ1bmRlZmluZWRcIikgeyAvLyBYRG9tYWluUmVxdWVzdCBvbmx5IGV4aXN0cyBpbiBJRVxyXG4gIC8vICAgICByZXEgPSBuZXcgdGhpcy53aW5kb3cuWERvbWFpblJlcXVlc3QoKTtcclxuICAvLyAgICAgcmVxLm9ubG9hZCA9IG9uU3VjY2VzcztcclxuICAvLyAgICAgcmVxLm9uZXJyb3IgPSBvbkZhaWx1cmU7XHJcbiAgLy8gICAgIHJlcS5jb250ZW50VHlwZSA9IFwidGV4dC9wbGFpblwiO1xyXG4gIC8vICAgICByZXEub3BlbihcIlBPU1RcIiwgdXJsKTtcclxuICAvLyAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMud2luZG93LkFjdGl2ZVhPYmplY3QgIT09IFwidW5kZWZpbmVkXCIpIHsgLy8gSXMgaXQgT0s/IDopXHJcbiAgLy8gICAgIHJlcSA9IG5ldyB0aGlzLndpbmRvdy5BY3RpdmVYT2JqZWN0KFwiTWljcm9zb2Z0LlhNTEhUVFBcIik7XHJcbiAgLy8gICAgIHJlcS5vcGVuKFwiUE9TVFwiLCB1cmwpO1xyXG4gIC8vICAgfSBlbHNlIHtcclxuICAvLyAgICAgLy8gVE9ETyBGaXJlZm94IGluIHRlc3QgbW9kZSBnZXQgdG8gdGhpcyBicmFuY2hcclxuICAvLyAgICAgcmVxLm9wZW4oXCJQT1NUXCIsIHVybCwgIXN5bmMpO1xyXG4gIC8vICAgICByZXEub25sb2FkID0gb25SZXNwb25zZTtcclxuICAvLyAgICAgcmVxLnNldFJlcXVlc3RIZWFkZXIoXCJDb250ZW50LXR5cGVcIiwgXCJ0ZXh0L3BsYWluXCIpO1xyXG4gIC8vICAgICAvL3JlcSA9IG51bGw7XHJcbiAgLy8gICAgIC8vdGhyb3cgbmV3IEVycm9yKCdDT1JTIG5vdCBzdXBwb3J0ZWQnKTsgLy8gVE9ET1xyXG4gIC8vICAgfVxyXG4gIC8vICAgY29uc29sZS5sb2coaGVhZCArIHRoaXMuZW5jb2RlSGVhZGVycyhoZWFkZXJzKSArIHRoaXMuc2hpZnQoKSk7XHJcbiAgLy8gICByZXEuc2VuZChoZWFkICsgdGhpcy5lbmNvZGVIZWFkZXJzKGhlYWRlcnMpICsgdGhpcy5zaGlmdCgpKTtcclxuXHJcbiAgLy8gICByZXR1cm4gdHJ1ZTtcclxuICAvLyB9O1xyXG5cclxuICAvKipcclxuICAgKiBTZXRzIGRlc3RpbmF0aW9uIFVSTC5cclxuICAgKi9cclxuICBzZXRVcmwodSkge1xyXG4gICAgdXJsID0gdTtcclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHJlcXVlc3QgaGVhZGVyIGsvdiBwYWlyLlxyXG4gICAqL1xyXG4gIHNldEhlYWRlcihrZXksIHZhbHVlKSB7XHJcbiAgICBoZWFkZXJzW2tleV0gPSB2YWx1ZTtcclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHNlc3Npb24gSUQgZm9yIHRoaXMgc2Vzc2lvbi5cclxuICAgKi9cclxuICBzZXRTZXNzaW9uSShzKSB7XHJcbiAgICBzZXNzaW9uSUQgPSBzO1xyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgY3VycmVudCBidWZmZXIgY29udGVudHMgKHdpdGhvdXQgdmVyc2lvbiBtYWdpYyBhbmQgaGVhZGVycykuXHJcbiAgICovXHJcbiAgZ2V0QnVmZmVyKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuYnVmZmVyO1xyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIEVuY29kZXMgYW5kIHB1c2hlcyB2YWx1ZXMgc2FtcGxlZCBieSBpdHMgZ2l2ZW4gc2l6ZSBpbnRvIGJ1ZmZlci5cclxuICAgKi9cclxuICBwdXNoKHZhbHVlcywgc2l6ZXMpIHtcclxuICAgIHRoaXMuYnVmZmVyICs9IHRoaXMuZW5jb2RlVmFsdWVzKHZhbHVlcywgc2l6ZXMpO1xyXG4gICAgcmV0dXJuIHRoaXMuYnVmZmVyO1xyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIEVuY29kZXMgcmF3IGJ5dGVzIGludG8gc3RyZWFtIGZvcm1hdCAobGVuZ3RoICsgVVJJIGVuY29kZWQgc3RyaW5nXHJcbiAgICogcmVwcmVzZW50YXRpb24pLlxyXG4gICAqL1xyXG4gIC8vIHRoaXMuZW5jb2RlUmF3Qnl0ZXMgPSBlbmNvZGVSYXdCeXRlcztcclxuXHJcbiAgLyoqXHJcbiAgICogQXBwZW5kcyByYXcgKGVuY29kZWQpIGJ5dGVzIHRvIGJ1ZmZlci5cclxuICAgKi9cclxuICBwdXNoUmF3Qnl0ZXMoYnl0ZXMpIHtcclxuICAgIHRoaXMuYnVmZmVyICs9IHRoaXMuZW5jb2RlUmF3Qnl0ZXMoYnl0ZXMpO1xyXG4gICAgcmV0dXJuIHRoaXMuYnVmZmVyO1xyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlc2V0cyBidWZmZXIuXHJcbiAgICovXHJcbiAgLy8gdGhpcy5yZXNldCA9IHJlc2V0O1xyXG5cclxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFRyYW5zcG9ydDtcclxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3RyYW5zcG9ydC5qcyIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG52YXIgZm9ybWF0UmVnRXhwID0gLyVbc2RqJV0vZztcbmV4cG9ydHMuZm9ybWF0ID0gZnVuY3Rpb24oZikge1xuICBpZiAoIWlzU3RyaW5nKGYpKSB7XG4gICAgdmFyIG9iamVjdHMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgb2JqZWN0cy5wdXNoKGluc3BlY3QoYXJndW1lbnRzW2ldKSk7XG4gICAgfVxuICAgIHJldHVybiBvYmplY3RzLmpvaW4oJyAnKTtcbiAgfVxuXG4gIHZhciBpID0gMTtcbiAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gIHZhciBsZW4gPSBhcmdzLmxlbmd0aDtcbiAgdmFyIHN0ciA9IFN0cmluZyhmKS5yZXBsYWNlKGZvcm1hdFJlZ0V4cCwgZnVuY3Rpb24oeCkge1xuICAgIGlmICh4ID09PSAnJSUnKSByZXR1cm4gJyUnO1xuICAgIGlmIChpID49IGxlbikgcmV0dXJuIHg7XG4gICAgc3dpdGNoICh4KSB7XG4gICAgICBjYXNlICclcyc6IHJldHVybiBTdHJpbmcoYXJnc1tpKytdKTtcbiAgICAgIGNhc2UgJyVkJzogcmV0dXJuIE51bWJlcihhcmdzW2krK10pO1xuICAgICAgY2FzZSAnJWonOlxuICAgICAgICB0cnkge1xuICAgICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShhcmdzW2krK10pO1xuICAgICAgICB9IGNhdGNoIChfKSB7XG4gICAgICAgICAgcmV0dXJuICdbQ2lyY3VsYXJdJztcbiAgICAgICAgfVxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIHg7XG4gICAgfVxuICB9KTtcbiAgZm9yICh2YXIgeCA9IGFyZ3NbaV07IGkgPCBsZW47IHggPSBhcmdzWysraV0pIHtcbiAgICBpZiAoaXNOdWxsKHgpIHx8ICFpc09iamVjdCh4KSkge1xuICAgICAgc3RyICs9ICcgJyArIHg7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciArPSAnICcgKyBpbnNwZWN0KHgpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gc3RyO1xufTtcblxuXG4vLyBNYXJrIHRoYXQgYSBtZXRob2Qgc2hvdWxkIG5vdCBiZSB1c2VkLlxuLy8gUmV0dXJucyBhIG1vZGlmaWVkIGZ1bmN0aW9uIHdoaWNoIHdhcm5zIG9uY2UgYnkgZGVmYXVsdC5cbi8vIElmIC0tbm8tZGVwcmVjYXRpb24gaXMgc2V0LCB0aGVuIGl0IGlzIGEgbm8tb3AuXG5leHBvcnRzLmRlcHJlY2F0ZSA9IGZ1bmN0aW9uKGZuLCBtc2cpIHtcbiAgLy8gQWxsb3cgZm9yIGRlcHJlY2F0aW5nIHRoaW5ncyBpbiB0aGUgcHJvY2VzcyBvZiBzdGFydGluZyB1cC5cbiAgaWYgKGlzVW5kZWZpbmVkKGdsb2JhbC5wcm9jZXNzKSkge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBleHBvcnRzLmRlcHJlY2F0ZShmbiwgbXNnKS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH07XG4gIH1cblxuICBpZiAocHJvY2Vzcy5ub0RlcHJlY2F0aW9uID09PSB0cnVlKSB7XG4gICAgcmV0dXJuIGZuO1xuICB9XG5cbiAgdmFyIHdhcm5lZCA9IGZhbHNlO1xuICBmdW5jdGlvbiBkZXByZWNhdGVkKCkge1xuICAgIGlmICghd2FybmVkKSB7XG4gICAgICBpZiAocHJvY2Vzcy50aHJvd0RlcHJlY2F0aW9uKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihtc2cpO1xuICAgICAgfSBlbHNlIGlmIChwcm9jZXNzLnRyYWNlRGVwcmVjYXRpb24pIHtcbiAgICAgICAgY29uc29sZS50cmFjZShtc2cpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihtc2cpO1xuICAgICAgfVxuICAgICAgd2FybmVkID0gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cblxuICByZXR1cm4gZGVwcmVjYXRlZDtcbn07XG5cblxudmFyIGRlYnVncyA9IHt9O1xudmFyIGRlYnVnRW52aXJvbjtcbmV4cG9ydHMuZGVidWdsb2cgPSBmdW5jdGlvbihzZXQpIHtcbiAgaWYgKGlzVW5kZWZpbmVkKGRlYnVnRW52aXJvbikpXG4gICAgZGVidWdFbnZpcm9uID0gcHJvY2Vzcy5lbnYuTk9ERV9ERUJVRyB8fCAnJztcbiAgc2V0ID0gc2V0LnRvVXBwZXJDYXNlKCk7XG4gIGlmICghZGVidWdzW3NldF0pIHtcbiAgICBpZiAobmV3IFJlZ0V4cCgnXFxcXGInICsgc2V0ICsgJ1xcXFxiJywgJ2knKS50ZXN0KGRlYnVnRW52aXJvbikpIHtcbiAgICAgIHZhciBwaWQgPSBwcm9jZXNzLnBpZDtcbiAgICAgIGRlYnVnc1tzZXRdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBtc2cgPSBleHBvcnRzLmZvcm1hdC5hcHBseShleHBvcnRzLCBhcmd1bWVudHMpO1xuICAgICAgICBjb25zb2xlLmVycm9yKCclcyAlZDogJXMnLCBzZXQsIHBpZCwgbXNnKTtcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlYnVnc1tzZXRdID0gZnVuY3Rpb24oKSB7fTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGRlYnVnc1tzZXRdO1xufTtcblxuXG4vKipcbiAqIEVjaG9zIHRoZSB2YWx1ZSBvZiBhIHZhbHVlLiBUcnlzIHRvIHByaW50IHRoZSB2YWx1ZSBvdXRcbiAqIGluIHRoZSBiZXN0IHdheSBwb3NzaWJsZSBnaXZlbiB0aGUgZGlmZmVyZW50IHR5cGVzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmogVGhlIG9iamVjdCB0byBwcmludCBvdXQuXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0cyBPcHRpb25hbCBvcHRpb25zIG9iamVjdCB0aGF0IGFsdGVycyB0aGUgb3V0cHV0LlxuICovXG4vKiBsZWdhY3k6IG9iaiwgc2hvd0hpZGRlbiwgZGVwdGgsIGNvbG9ycyovXG5mdW5jdGlvbiBpbnNwZWN0KG9iaiwgb3B0cykge1xuICAvLyBkZWZhdWx0IG9wdGlvbnNcbiAgdmFyIGN0eCA9IHtcbiAgICBzZWVuOiBbXSxcbiAgICBzdHlsaXplOiBzdHlsaXplTm9Db2xvclxuICB9O1xuICAvLyBsZWdhY3kuLi5cbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPj0gMykgY3R4LmRlcHRoID0gYXJndW1lbnRzWzJdO1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+PSA0KSBjdHguY29sb3JzID0gYXJndW1lbnRzWzNdO1xuICBpZiAoaXNCb29sZWFuKG9wdHMpKSB7XG4gICAgLy8gbGVnYWN5Li4uXG4gICAgY3R4LnNob3dIaWRkZW4gPSBvcHRzO1xuICB9IGVsc2UgaWYgKG9wdHMpIHtcbiAgICAvLyBnb3QgYW4gXCJvcHRpb25zXCIgb2JqZWN0XG4gICAgZXhwb3J0cy5fZXh0ZW5kKGN0eCwgb3B0cyk7XG4gIH1cbiAgLy8gc2V0IGRlZmF1bHQgb3B0aW9uc1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LnNob3dIaWRkZW4pKSBjdHguc2hvd0hpZGRlbiA9IGZhbHNlO1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LmRlcHRoKSkgY3R4LmRlcHRoID0gMjtcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5jb2xvcnMpKSBjdHguY29sb3JzID0gZmFsc2U7XG4gIGlmIChpc1VuZGVmaW5lZChjdHguY3VzdG9tSW5zcGVjdCkpIGN0eC5jdXN0b21JbnNwZWN0ID0gdHJ1ZTtcbiAgaWYgKGN0eC5jb2xvcnMpIGN0eC5zdHlsaXplID0gc3R5bGl6ZVdpdGhDb2xvcjtcbiAgcmV0dXJuIGZvcm1hdFZhbHVlKGN0eCwgb2JqLCBjdHguZGVwdGgpO1xufVxuZXhwb3J0cy5pbnNwZWN0ID0gaW5zcGVjdDtcblxuXG4vLyBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0FOU0lfZXNjYXBlX2NvZGUjZ3JhcGhpY3Ncbmluc3BlY3QuY29sb3JzID0ge1xuICAnYm9sZCcgOiBbMSwgMjJdLFxuICAnaXRhbGljJyA6IFszLCAyM10sXG4gICd1bmRlcmxpbmUnIDogWzQsIDI0XSxcbiAgJ2ludmVyc2UnIDogWzcsIDI3XSxcbiAgJ3doaXRlJyA6IFszNywgMzldLFxuICAnZ3JleScgOiBbOTAsIDM5XSxcbiAgJ2JsYWNrJyA6IFszMCwgMzldLFxuICAnYmx1ZScgOiBbMzQsIDM5XSxcbiAgJ2N5YW4nIDogWzM2LCAzOV0sXG4gICdncmVlbicgOiBbMzIsIDM5XSxcbiAgJ21hZ2VudGEnIDogWzM1LCAzOV0sXG4gICdyZWQnIDogWzMxLCAzOV0sXG4gICd5ZWxsb3cnIDogWzMzLCAzOV1cbn07XG5cbi8vIERvbid0IHVzZSAnYmx1ZScgbm90IHZpc2libGUgb24gY21kLmV4ZVxuaW5zcGVjdC5zdHlsZXMgPSB7XG4gICdzcGVjaWFsJzogJ2N5YW4nLFxuICAnbnVtYmVyJzogJ3llbGxvdycsXG4gICdib29sZWFuJzogJ3llbGxvdycsXG4gICd1bmRlZmluZWQnOiAnZ3JleScsXG4gICdudWxsJzogJ2JvbGQnLFxuICAnc3RyaW5nJzogJ2dyZWVuJyxcbiAgJ2RhdGUnOiAnbWFnZW50YScsXG4gIC8vIFwibmFtZVwiOiBpbnRlbnRpb25hbGx5IG5vdCBzdHlsaW5nXG4gICdyZWdleHAnOiAncmVkJ1xufTtcblxuXG5mdW5jdGlvbiBzdHlsaXplV2l0aENvbG9yKHN0ciwgc3R5bGVUeXBlKSB7XG4gIHZhciBzdHlsZSA9IGluc3BlY3Quc3R5bGVzW3N0eWxlVHlwZV07XG5cbiAgaWYgKHN0eWxlKSB7XG4gICAgcmV0dXJuICdcXHUwMDFiWycgKyBpbnNwZWN0LmNvbG9yc1tzdHlsZV1bMF0gKyAnbScgKyBzdHIgK1xuICAgICAgICAgICAnXFx1MDAxYlsnICsgaW5zcGVjdC5jb2xvcnNbc3R5bGVdWzFdICsgJ20nO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBzdHI7XG4gIH1cbn1cblxuXG5mdW5jdGlvbiBzdHlsaXplTm9Db2xvcihzdHIsIHN0eWxlVHlwZSkge1xuICByZXR1cm4gc3RyO1xufVxuXG5cbmZ1bmN0aW9uIGFycmF5VG9IYXNoKGFycmF5KSB7XG4gIHZhciBoYXNoID0ge307XG5cbiAgYXJyYXkuZm9yRWFjaChmdW5jdGlvbih2YWwsIGlkeCkge1xuICAgIGhhc2hbdmFsXSA9IHRydWU7XG4gIH0pO1xuXG4gIHJldHVybiBoYXNoO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdFZhbHVlKGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcykge1xuICAvLyBQcm92aWRlIGEgaG9vayBmb3IgdXNlci1zcGVjaWZpZWQgaW5zcGVjdCBmdW5jdGlvbnMuXG4gIC8vIENoZWNrIHRoYXQgdmFsdWUgaXMgYW4gb2JqZWN0IHdpdGggYW4gaW5zcGVjdCBmdW5jdGlvbiBvbiBpdFxuICBpZiAoY3R4LmN1c3RvbUluc3BlY3QgJiZcbiAgICAgIHZhbHVlICYmXG4gICAgICBpc0Z1bmN0aW9uKHZhbHVlLmluc3BlY3QpICYmXG4gICAgICAvLyBGaWx0ZXIgb3V0IHRoZSB1dGlsIG1vZHVsZSwgaXQncyBpbnNwZWN0IGZ1bmN0aW9uIGlzIHNwZWNpYWxcbiAgICAgIHZhbHVlLmluc3BlY3QgIT09IGV4cG9ydHMuaW5zcGVjdCAmJlxuICAgICAgLy8gQWxzbyBmaWx0ZXIgb3V0IGFueSBwcm90b3R5cGUgb2JqZWN0cyB1c2luZyB0aGUgY2lyY3VsYXIgY2hlY2suXG4gICAgICAhKHZhbHVlLmNvbnN0cnVjdG9yICYmIHZhbHVlLmNvbnN0cnVjdG9yLnByb3RvdHlwZSA9PT0gdmFsdWUpKSB7XG4gICAgdmFyIHJldCA9IHZhbHVlLmluc3BlY3QocmVjdXJzZVRpbWVzLCBjdHgpO1xuICAgIGlmICghaXNTdHJpbmcocmV0KSkge1xuICAgICAgcmV0ID0gZm9ybWF0VmFsdWUoY3R4LCByZXQsIHJlY3Vyc2VUaW1lcyk7XG4gICAgfVxuICAgIHJldHVybiByZXQ7XG4gIH1cblxuICAvLyBQcmltaXRpdmUgdHlwZXMgY2Fubm90IGhhdmUgcHJvcGVydGllc1xuICB2YXIgcHJpbWl0aXZlID0gZm9ybWF0UHJpbWl0aXZlKGN0eCwgdmFsdWUpO1xuICBpZiAocHJpbWl0aXZlKSB7XG4gICAgcmV0dXJuIHByaW1pdGl2ZTtcbiAgfVxuXG4gIC8vIExvb2sgdXAgdGhlIGtleXMgb2YgdGhlIG9iamVjdC5cbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyh2YWx1ZSk7XG4gIHZhciB2aXNpYmxlS2V5cyA9IGFycmF5VG9IYXNoKGtleXMpO1xuXG4gIGlmIChjdHguc2hvd0hpZGRlbikge1xuICAgIGtleXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh2YWx1ZSk7XG4gIH1cblxuICAvLyBJRSBkb2Vzbid0IG1ha2UgZXJyb3IgZmllbGRzIG5vbi1lbnVtZXJhYmxlXG4gIC8vIGh0dHA6Ly9tc2RuLm1pY3Jvc29mdC5jb20vZW4tdXMvbGlicmFyeS9pZS9kd3c1MnNidCh2PXZzLjk0KS5hc3B4XG4gIGlmIChpc0Vycm9yKHZhbHVlKVxuICAgICAgJiYgKGtleXMuaW5kZXhPZignbWVzc2FnZScpID49IDAgfHwga2V5cy5pbmRleE9mKCdkZXNjcmlwdGlvbicpID49IDApKSB7XG4gICAgcmV0dXJuIGZvcm1hdEVycm9yKHZhbHVlKTtcbiAgfVxuXG4gIC8vIFNvbWUgdHlwZSBvZiBvYmplY3Qgd2l0aG91dCBwcm9wZXJ0aWVzIGNhbiBiZSBzaG9ydGN1dHRlZC5cbiAgaWYgKGtleXMubGVuZ3RoID09PSAwKSB7XG4gICAgaWYgKGlzRnVuY3Rpb24odmFsdWUpKSB7XG4gICAgICB2YXIgbmFtZSA9IHZhbHVlLm5hbWUgPyAnOiAnICsgdmFsdWUubmFtZSA6ICcnO1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKCdbRnVuY3Rpb24nICsgbmFtZSArICddJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gICAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSksICdyZWdleHAnKTtcbiAgICB9XG4gICAgaWYgKGlzRGF0ZSh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShEYXRlLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSwgJ2RhdGUnKTtcbiAgICB9XG4gICAgaWYgKGlzRXJyb3IodmFsdWUpKSB7XG4gICAgICByZXR1cm4gZm9ybWF0RXJyb3IodmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIHZhciBiYXNlID0gJycsIGFycmF5ID0gZmFsc2UsIGJyYWNlcyA9IFsneycsICd9J107XG5cbiAgLy8gTWFrZSBBcnJheSBzYXkgdGhhdCB0aGV5IGFyZSBBcnJheVxuICBpZiAoaXNBcnJheSh2YWx1ZSkpIHtcbiAgICBhcnJheSA9IHRydWU7XG4gICAgYnJhY2VzID0gWydbJywgJ10nXTtcbiAgfVxuXG4gIC8vIE1ha2UgZnVuY3Rpb25zIHNheSB0aGF0IHRoZXkgYXJlIGZ1bmN0aW9uc1xuICBpZiAoaXNGdW5jdGlvbih2YWx1ZSkpIHtcbiAgICB2YXIgbiA9IHZhbHVlLm5hbWUgPyAnOiAnICsgdmFsdWUubmFtZSA6ICcnO1xuICAgIGJhc2UgPSAnIFtGdW5jdGlvbicgKyBuICsgJ10nO1xuICB9XG5cbiAgLy8gTWFrZSBSZWdFeHBzIHNheSB0aGF0IHRoZXkgYXJlIFJlZ0V4cHNcbiAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgIGJhc2UgPSAnICcgKyBSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpO1xuICB9XG5cbiAgLy8gTWFrZSBkYXRlcyB3aXRoIHByb3BlcnRpZXMgZmlyc3Qgc2F5IHRoZSBkYXRlXG4gIGlmIChpc0RhdGUodmFsdWUpKSB7XG4gICAgYmFzZSA9ICcgJyArIERhdGUucHJvdG90eXBlLnRvVVRDU3RyaW5nLmNhbGwodmFsdWUpO1xuICB9XG5cbiAgLy8gTWFrZSBlcnJvciB3aXRoIG1lc3NhZ2UgZmlyc3Qgc2F5IHRoZSBlcnJvclxuICBpZiAoaXNFcnJvcih2YWx1ZSkpIHtcbiAgICBiYXNlID0gJyAnICsgZm9ybWF0RXJyb3IodmFsdWUpO1xuICB9XG5cbiAgaWYgKGtleXMubGVuZ3RoID09PSAwICYmICghYXJyYXkgfHwgdmFsdWUubGVuZ3RoID09IDApKSB7XG4gICAgcmV0dXJuIGJyYWNlc1swXSArIGJhc2UgKyBicmFjZXNbMV07XG4gIH1cblxuICBpZiAocmVjdXJzZVRpbWVzIDwgMCkge1xuICAgIGlmIChpc1JlZ0V4cCh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpLCAncmVnZXhwJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZSgnW09iamVjdF0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfVxuXG4gIGN0eC5zZWVuLnB1c2godmFsdWUpO1xuXG4gIHZhciBvdXRwdXQ7XG4gIGlmIChhcnJheSkge1xuICAgIG91dHB1dCA9IGZvcm1hdEFycmF5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleXMpO1xuICB9IGVsc2Uge1xuICAgIG91dHB1dCA9IGtleXMubWFwKGZ1bmN0aW9uKGtleSkge1xuICAgICAgcmV0dXJuIGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleSwgYXJyYXkpO1xuICAgIH0pO1xuICB9XG5cbiAgY3R4LnNlZW4ucG9wKCk7XG5cbiAgcmV0dXJuIHJlZHVjZVRvU2luZ2xlU3RyaW5nKG91dHB1dCwgYmFzZSwgYnJhY2VzKTtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRQcmltaXRpdmUoY3R4LCB2YWx1ZSkge1xuICBpZiAoaXNVbmRlZmluZWQodmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgndW5kZWZpbmVkJywgJ3VuZGVmaW5lZCcpO1xuICBpZiAoaXNTdHJpbmcodmFsdWUpKSB7XG4gICAgdmFyIHNpbXBsZSA9ICdcXCcnICsgSlNPTi5zdHJpbmdpZnkodmFsdWUpLnJlcGxhY2UoL15cInxcIiQvZywgJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvJy9nLCBcIlxcXFwnXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxcXFwiL2csICdcIicpICsgJ1xcJyc7XG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKHNpbXBsZSwgJ3N0cmluZycpO1xuICB9XG4gIGlmIChpc051bWJlcih2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCcnICsgdmFsdWUsICdudW1iZXInKTtcbiAgaWYgKGlzQm9vbGVhbih2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCcnICsgdmFsdWUsICdib29sZWFuJyk7XG4gIC8vIEZvciBzb21lIHJlYXNvbiB0eXBlb2YgbnVsbCBpcyBcIm9iamVjdFwiLCBzbyBzcGVjaWFsIGNhc2UgaGVyZS5cbiAgaWYgKGlzTnVsbCh2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCdudWxsJywgJ251bGwnKTtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRFcnJvcih2YWx1ZSkge1xuICByZXR1cm4gJ1snICsgRXJyb3IucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpICsgJ10nO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdEFycmF5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleXMpIHtcbiAgdmFyIG91dHB1dCA9IFtdO1xuICBmb3IgKHZhciBpID0gMCwgbCA9IHZhbHVlLmxlbmd0aDsgaSA8IGw7ICsraSkge1xuICAgIGlmIChoYXNPd25Qcm9wZXJ0eSh2YWx1ZSwgU3RyaW5nKGkpKSkge1xuICAgICAgb3V0cHV0LnB1c2goZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cyxcbiAgICAgICAgICBTdHJpbmcoaSksIHRydWUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0cHV0LnB1c2goJycpO1xuICAgIH1cbiAgfVxuICBrZXlzLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgaWYgKCFrZXkubWF0Y2goL15cXGQrJC8pKSB7XG4gICAgICBvdXRwdXQucHVzaChmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLFxuICAgICAgICAgIGtleSwgdHJ1ZSkpO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBvdXRwdXQ7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5LCBhcnJheSkge1xuICB2YXIgbmFtZSwgc3RyLCBkZXNjO1xuICBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih2YWx1ZSwga2V5KSB8fCB7IHZhbHVlOiB2YWx1ZVtrZXldIH07XG4gIGlmIChkZXNjLmdldCkge1xuICAgIGlmIChkZXNjLnNldCkge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tHZXR0ZXIvU2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbR2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGlmIChkZXNjLnNldCkge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tTZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH1cbiAgaWYgKCFoYXNPd25Qcm9wZXJ0eSh2aXNpYmxlS2V5cywga2V5KSkge1xuICAgIG5hbWUgPSAnWycgKyBrZXkgKyAnXSc7XG4gIH1cbiAgaWYgKCFzdHIpIHtcbiAgICBpZiAoY3R4LnNlZW4uaW5kZXhPZihkZXNjLnZhbHVlKSA8IDApIHtcbiAgICAgIGlmIChpc051bGwocmVjdXJzZVRpbWVzKSkge1xuICAgICAgICBzdHIgPSBmb3JtYXRWYWx1ZShjdHgsIGRlc2MudmFsdWUsIG51bGwpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3RyID0gZm9ybWF0VmFsdWUoY3R4LCBkZXNjLnZhbHVlLCByZWN1cnNlVGltZXMgLSAxKTtcbiAgICAgIH1cbiAgICAgIGlmIChzdHIuaW5kZXhPZignXFxuJykgPiAtMSkge1xuICAgICAgICBpZiAoYXJyYXkpIHtcbiAgICAgICAgICBzdHIgPSBzdHIuc3BsaXQoJ1xcbicpLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgICAgICByZXR1cm4gJyAgJyArIGxpbmU7XG4gICAgICAgICAgfSkuam9pbignXFxuJykuc3Vic3RyKDIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN0ciA9ICdcXG4nICsgc3RyLnNwbGl0KCdcXG4nKS5tYXAoZnVuY3Rpb24obGluZSkge1xuICAgICAgICAgICAgcmV0dXJuICcgICAnICsgbGluZTtcbiAgICAgICAgICB9KS5qb2luKCdcXG4nKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW0NpcmN1bGFyXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9XG4gIGlmIChpc1VuZGVmaW5lZChuYW1lKSkge1xuICAgIGlmIChhcnJheSAmJiBrZXkubWF0Y2goL15cXGQrJC8pKSB7XG4gICAgICByZXR1cm4gc3RyO1xuICAgIH1cbiAgICBuYW1lID0gSlNPTi5zdHJpbmdpZnkoJycgKyBrZXkpO1xuICAgIGlmIChuYW1lLm1hdGNoKC9eXCIoW2EtekEtWl9dW2EtekEtWl8wLTldKilcIiQvKSkge1xuICAgICAgbmFtZSA9IG5hbWUuc3Vic3RyKDEsIG5hbWUubGVuZ3RoIC0gMik7XG4gICAgICBuYW1lID0gY3R4LnN0eWxpemUobmFtZSwgJ25hbWUnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbmFtZSA9IG5hbWUucmVwbGFjZSgvJy9nLCBcIlxcXFwnXCIpXG4gICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXFxcXCIvZywgJ1wiJylcbiAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLyheXCJ8XCIkKS9nLCBcIidcIik7XG4gICAgICBuYW1lID0gY3R4LnN0eWxpemUobmFtZSwgJ3N0cmluZycpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuYW1lICsgJzogJyArIHN0cjtcbn1cblxuXG5mdW5jdGlvbiByZWR1Y2VUb1NpbmdsZVN0cmluZyhvdXRwdXQsIGJhc2UsIGJyYWNlcykge1xuICB2YXIgbnVtTGluZXNFc3QgPSAwO1xuICB2YXIgbGVuZ3RoID0gb3V0cHV0LnJlZHVjZShmdW5jdGlvbihwcmV2LCBjdXIpIHtcbiAgICBudW1MaW5lc0VzdCsrO1xuICAgIGlmIChjdXIuaW5kZXhPZignXFxuJykgPj0gMCkgbnVtTGluZXNFc3QrKztcbiAgICByZXR1cm4gcHJldiArIGN1ci5yZXBsYWNlKC9cXHUwMDFiXFxbXFxkXFxkP20vZywgJycpLmxlbmd0aCArIDE7XG4gIH0sIDApO1xuXG4gIGlmIChsZW5ndGggPiA2MCkge1xuICAgIHJldHVybiBicmFjZXNbMF0gK1xuICAgICAgICAgICAoYmFzZSA9PT0gJycgPyAnJyA6IGJhc2UgKyAnXFxuICcpICtcbiAgICAgICAgICAgJyAnICtcbiAgICAgICAgICAgb3V0cHV0LmpvaW4oJyxcXG4gICcpICtcbiAgICAgICAgICAgJyAnICtcbiAgICAgICAgICAgYnJhY2VzWzFdO1xuICB9XG5cbiAgcmV0dXJuIGJyYWNlc1swXSArIGJhc2UgKyAnICcgKyBvdXRwdXQuam9pbignLCAnKSArICcgJyArIGJyYWNlc1sxXTtcbn1cblxuXG4vLyBOT1RFOiBUaGVzZSB0eXBlIGNoZWNraW5nIGZ1bmN0aW9ucyBpbnRlbnRpb25hbGx5IGRvbid0IHVzZSBgaW5zdGFuY2VvZmBcbi8vIGJlY2F1c2UgaXQgaXMgZnJhZ2lsZSBhbmQgY2FuIGJlIGVhc2lseSBmYWtlZCB3aXRoIGBPYmplY3QuY3JlYXRlKClgLlxuZnVuY3Rpb24gaXNBcnJheShhcikge1xuICByZXR1cm4gQXJyYXkuaXNBcnJheShhcik7XG59XG5leHBvcnRzLmlzQXJyYXkgPSBpc0FycmF5O1xuXG5mdW5jdGlvbiBpc0Jvb2xlYW4oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnYm9vbGVhbic7XG59XG5leHBvcnRzLmlzQm9vbGVhbiA9IGlzQm9vbGVhbjtcblxuZnVuY3Rpb24gaXNOdWxsKGFyZykge1xuICByZXR1cm4gYXJnID09PSBudWxsO1xufVxuZXhwb3J0cy5pc051bGwgPSBpc051bGw7XG5cbmZ1bmN0aW9uIGlzTnVsbE9yVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09IG51bGw7XG59XG5leHBvcnRzLmlzTnVsbE9yVW5kZWZpbmVkID0gaXNOdWxsT3JVbmRlZmluZWQ7XG5cbmZ1bmN0aW9uIGlzTnVtYmVyKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcic7XG59XG5leHBvcnRzLmlzTnVtYmVyID0gaXNOdW1iZXI7XG5cbmZ1bmN0aW9uIGlzU3RyaW5nKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ3N0cmluZyc7XG59XG5leHBvcnRzLmlzU3RyaW5nID0gaXNTdHJpbmc7XG5cbmZ1bmN0aW9uIGlzU3ltYm9sKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ3N5bWJvbCc7XG59XG5leHBvcnRzLmlzU3ltYm9sID0gaXNTeW1ib2w7XG5cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09PSB2b2lkIDA7XG59XG5leHBvcnRzLmlzVW5kZWZpbmVkID0gaXNVbmRlZmluZWQ7XG5cbmZ1bmN0aW9uIGlzUmVnRXhwKHJlKSB7XG4gIHJldHVybiBpc09iamVjdChyZSkgJiYgb2JqZWN0VG9TdHJpbmcocmUpID09PSAnW29iamVjdCBSZWdFeHBdJztcbn1cbmV4cG9ydHMuaXNSZWdFeHAgPSBpc1JlZ0V4cDtcblxuZnVuY3Rpb24gaXNPYmplY3QoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBhcmcgIT09IG51bGw7XG59XG5leHBvcnRzLmlzT2JqZWN0ID0gaXNPYmplY3Q7XG5cbmZ1bmN0aW9uIGlzRGF0ZShkKSB7XG4gIHJldHVybiBpc09iamVjdChkKSAmJiBvYmplY3RUb1N0cmluZyhkKSA9PT0gJ1tvYmplY3QgRGF0ZV0nO1xufVxuZXhwb3J0cy5pc0RhdGUgPSBpc0RhdGU7XG5cbmZ1bmN0aW9uIGlzRXJyb3IoZSkge1xuICByZXR1cm4gaXNPYmplY3QoZSkgJiZcbiAgICAgIChvYmplY3RUb1N0cmluZyhlKSA9PT0gJ1tvYmplY3QgRXJyb3JdJyB8fCBlIGluc3RhbmNlb2YgRXJyb3IpO1xufVxuZXhwb3J0cy5pc0Vycm9yID0gaXNFcnJvcjtcblxuZnVuY3Rpb24gaXNGdW5jdGlvbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdmdW5jdGlvbic7XG59XG5leHBvcnRzLmlzRnVuY3Rpb24gPSBpc0Z1bmN0aW9uO1xuXG5mdW5jdGlvbiBpc1ByaW1pdGl2ZShhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gbnVsbCB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ2Jvb2xlYW4nIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnbnVtYmVyJyB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ3N0cmluZycgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdzeW1ib2wnIHx8ICAvLyBFUzYgc3ltYm9sXG4gICAgICAgICB0eXBlb2YgYXJnID09PSAndW5kZWZpbmVkJztcbn1cbmV4cG9ydHMuaXNQcmltaXRpdmUgPSBpc1ByaW1pdGl2ZTtcblxuZXhwb3J0cy5pc0J1ZmZlciA9IHJlcXVpcmUoJy4vc3VwcG9ydC9pc0J1ZmZlcicpO1xuXG5mdW5jdGlvbiBvYmplY3RUb1N0cmluZyhvKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobyk7XG59XG5cblxuZnVuY3Rpb24gcGFkKG4pIHtcbiAgcmV0dXJuIG4gPCAxMCA/ICcwJyArIG4udG9TdHJpbmcoMTApIDogbi50b1N0cmluZygxMCk7XG59XG5cblxudmFyIG1vbnRocyA9IFsnSmFuJywgJ0ZlYicsICdNYXInLCAnQXByJywgJ01heScsICdKdW4nLCAnSnVsJywgJ0F1ZycsICdTZXAnLFxuICAgICAgICAgICAgICAnT2N0JywgJ05vdicsICdEZWMnXTtcblxuLy8gMjYgRmViIDE2OjE5OjM0XG5mdW5jdGlvbiB0aW1lc3RhbXAoKSB7XG4gIHZhciBkID0gbmV3IERhdGUoKTtcbiAgdmFyIHRpbWUgPSBbcGFkKGQuZ2V0SG91cnMoKSksXG4gICAgICAgICAgICAgIHBhZChkLmdldE1pbnV0ZXMoKSksXG4gICAgICAgICAgICAgIHBhZChkLmdldFNlY29uZHMoKSldLmpvaW4oJzonKTtcbiAgcmV0dXJuIFtkLmdldERhdGUoKSwgbW9udGhzW2QuZ2V0TW9udGgoKV0sIHRpbWVdLmpvaW4oJyAnKTtcbn1cblxuXG4vLyBsb2cgaXMganVzdCBhIHRoaW4gd3JhcHBlciB0byBjb25zb2xlLmxvZyB0aGF0IHByZXBlbmRzIGEgdGltZXN0YW1wXG5leHBvcnRzLmxvZyA9IGZ1bmN0aW9uKCkge1xuICBjb25zb2xlLmxvZygnJXMgLSAlcycsIHRpbWVzdGFtcCgpLCBleHBvcnRzLmZvcm1hdC5hcHBseShleHBvcnRzLCBhcmd1bWVudHMpKTtcbn07XG5cblxuLyoqXG4gKiBJbmhlcml0IHRoZSBwcm90b3R5cGUgbWV0aG9kcyBmcm9tIG9uZSBjb25zdHJ1Y3RvciBpbnRvIGFub3RoZXIuXG4gKlxuICogVGhlIEZ1bmN0aW9uLnByb3RvdHlwZS5pbmhlcml0cyBmcm9tIGxhbmcuanMgcmV3cml0dGVuIGFzIGEgc3RhbmRhbG9uZVxuICogZnVuY3Rpb24gKG5vdCBvbiBGdW5jdGlvbi5wcm90b3R5cGUpLiBOT1RFOiBJZiB0aGlzIGZpbGUgaXMgdG8gYmUgbG9hZGVkXG4gKiBkdXJpbmcgYm9vdHN0cmFwcGluZyB0aGlzIGZ1bmN0aW9uIG5lZWRzIHRvIGJlIHJld3JpdHRlbiB1c2luZyBzb21lIG5hdGl2ZVxuICogZnVuY3Rpb25zIGFzIHByb3RvdHlwZSBzZXR1cCB1c2luZyBub3JtYWwgSmF2YVNjcmlwdCBkb2VzIG5vdCB3b3JrIGFzXG4gKiBleHBlY3RlZCBkdXJpbmcgYm9vdHN0cmFwcGluZyAoc2VlIG1pcnJvci5qcyBpbiByMTE0OTAzKS5cbiAqXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjdG9yIENvbnN0cnVjdG9yIGZ1bmN0aW9uIHdoaWNoIG5lZWRzIHRvIGluaGVyaXQgdGhlXG4gKiAgICAgcHJvdG90eXBlLlxuICogQHBhcmFtIHtmdW5jdGlvbn0gc3VwZXJDdG9yIENvbnN0cnVjdG9yIGZ1bmN0aW9uIHRvIGluaGVyaXQgcHJvdG90eXBlIGZyb20uXG4gKi9cbmV4cG9ydHMuaW5oZXJpdHMgPSByZXF1aXJlKCdpbmhlcml0cycpO1xuXG5leHBvcnRzLl9leHRlbmQgPSBmdW5jdGlvbihvcmlnaW4sIGFkZCkge1xuICAvLyBEb24ndCBkbyBhbnl0aGluZyBpZiBhZGQgaXNuJ3QgYW4gb2JqZWN0XG4gIGlmICghYWRkIHx8ICFpc09iamVjdChhZGQpKSByZXR1cm4gb3JpZ2luO1xuXG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXMoYWRkKTtcbiAgdmFyIGkgPSBrZXlzLmxlbmd0aDtcbiAgd2hpbGUgKGktLSkge1xuICAgIG9yaWdpbltrZXlzW2ldXSA9IGFkZFtrZXlzW2ldXTtcbiAgfVxuICByZXR1cm4gb3JpZ2luO1xufTtcblxuZnVuY3Rpb24gaGFzT3duUHJvcGVydHkob2JqLCBwcm9wKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKTtcbn1cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL3V0aWwvdXRpbC5qc1xuLy8gbW9kdWxlIGlkID0gMTNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIDEiLCJ2YXIgZztcclxuXHJcbi8vIFRoaXMgd29ya3MgaW4gbm9uLXN0cmljdCBtb2RlXHJcbmcgPSAoZnVuY3Rpb24oKSB7XHJcblx0cmV0dXJuIHRoaXM7XHJcbn0pKCk7XHJcblxyXG50cnkge1xyXG5cdC8vIFRoaXMgd29ya3MgaWYgZXZhbCBpcyBhbGxvd2VkIChzZWUgQ1NQKVxyXG5cdGcgPSBnIHx8IEZ1bmN0aW9uKFwicmV0dXJuIHRoaXNcIikoKSB8fCAoMSxldmFsKShcInRoaXNcIik7XHJcbn0gY2F0Y2goZSkge1xyXG5cdC8vIFRoaXMgd29ya3MgaWYgdGhlIHdpbmRvdyByZWZlcmVuY2UgaXMgYXZhaWxhYmxlXHJcblx0aWYodHlwZW9mIHdpbmRvdyA9PT0gXCJvYmplY3RcIilcclxuXHRcdGcgPSB3aW5kb3c7XHJcbn1cclxuXHJcbi8vIGcgY2FuIHN0aWxsIGJlIHVuZGVmaW5lZCwgYnV0IG5vdGhpbmcgdG8gZG8gYWJvdXQgaXQuLi5cclxuLy8gV2UgcmV0dXJuIHVuZGVmaW5lZCwgaW5zdGVhZCBvZiBub3RoaW5nIGhlcmUsIHNvIGl0J3NcclxuLy8gZWFzaWVyIHRvIGhhbmRsZSB0aGlzIGNhc2UuIGlmKCFnbG9iYWwpIHsgLi4ufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBnO1xyXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAod2VicGFjaykvYnVpbGRpbi9nbG9iYWwuanNcbi8vIG1vZHVsZSBpZCA9IDE0XG4vLyBtb2R1bGUgY2h1bmtzID0gMCAxIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbi8vIGNhY2hlZCBmcm9tIHdoYXRldmVyIGdsb2JhbCBpcyBwcmVzZW50IHNvIHRoYXQgdGVzdCBydW5uZXJzIHRoYXQgc3R1YiBpdFxuLy8gZG9uJ3QgYnJlYWsgdGhpbmdzLiAgQnV0IHdlIG5lZWQgdG8gd3JhcCBpdCBpbiBhIHRyeSBjYXRjaCBpbiBjYXNlIGl0IGlzXG4vLyB3cmFwcGVkIGluIHN0cmljdCBtb2RlIGNvZGUgd2hpY2ggZG9lc24ndCBkZWZpbmUgYW55IGdsb2JhbHMuICBJdCdzIGluc2lkZSBhXG4vLyBmdW5jdGlvbiBiZWNhdXNlIHRyeS9jYXRjaGVzIGRlb3B0aW1pemUgaW4gY2VydGFpbiBlbmdpbmVzLlxuXG52YXIgY2FjaGVkU2V0VGltZW91dDtcbnZhciBjYWNoZWRDbGVhclRpbWVvdXQ7XG5cbmZ1bmN0aW9uIGRlZmF1bHRTZXRUaW1vdXQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZXRUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG5mdW5jdGlvbiBkZWZhdWx0Q2xlYXJUaW1lb3V0ICgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2NsZWFyVGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuKGZ1bmN0aW9uICgpIHtcbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIHNldFRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIGNsZWFyVGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICB9XG59ICgpKVxuZnVuY3Rpb24gcnVuVGltZW91dChmdW4pIHtcbiAgICBpZiAoY2FjaGVkU2V0VGltZW91dCA9PT0gc2V0VGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgLy8gaWYgc2V0VGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZFNldFRpbWVvdXQgPT09IGRlZmF1bHRTZXRUaW1vdXQgfHwgIWNhY2hlZFNldFRpbWVvdXQpICYmIHNldFRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9IGNhdGNoKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0IHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKG51bGwsIGZ1biwgMCk7XG4gICAgICAgIH0gY2F0Y2goZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvclxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbCh0aGlzLCBmdW4sIDApO1xuICAgICAgICB9XG4gICAgfVxuXG5cbn1cbmZ1bmN0aW9uIHJ1bkNsZWFyVGltZW91dChtYXJrZXIpIHtcbiAgICBpZiAoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgLy8gaWYgY2xlYXJUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBkZWZhdWx0Q2xlYXJUaW1lb3V0IHx8ICFjYWNoZWRDbGVhclRpbWVvdXQpICYmIGNsZWFyVGltZW91dCkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfSBjYXRjaCAoZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgIHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwobnVsbCwgbWFya2VyKTtcbiAgICAgICAgfSBjYXRjaCAoZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvci5cbiAgICAgICAgICAgIC8vIFNvbWUgdmVyc2lvbnMgb2YgSS5FLiBoYXZlIGRpZmZlcmVudCBydWxlcyBmb3IgY2xlYXJUaW1lb3V0IHZzIHNldFRpbWVvdXRcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbCh0aGlzLCBtYXJrZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG5cblxufVxudmFyIHF1ZXVlID0gW107XG52YXIgZHJhaW5pbmcgPSBmYWxzZTtcbnZhciBjdXJyZW50UXVldWU7XG52YXIgcXVldWVJbmRleCA9IC0xO1xuXG5mdW5jdGlvbiBjbGVhblVwTmV4dFRpY2soKSB7XG4gICAgaWYgKCFkcmFpbmluZyB8fCAhY3VycmVudFF1ZXVlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBpZiAoY3VycmVudFF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBxdWV1ZSA9IGN1cnJlbnRRdWV1ZS5jb25jYXQocXVldWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICB9XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBkcmFpblF1ZXVlKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkcmFpblF1ZXVlKCkge1xuICAgIGlmIChkcmFpbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0aW1lb3V0ID0gcnVuVGltZW91dChjbGVhblVwTmV4dFRpY2spO1xuICAgIGRyYWluaW5nID0gdHJ1ZTtcblxuICAgIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgd2hpbGUobGVuKSB7XG4gICAgICAgIGN1cnJlbnRRdWV1ZSA9IHF1ZXVlO1xuICAgICAgICBxdWV1ZSA9IFtdO1xuICAgICAgICB3aGlsZSAoKytxdWV1ZUluZGV4IDwgbGVuKSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudFF1ZXVlKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFF1ZXVlW3F1ZXVlSW5kZXhdLnJ1bigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICAgICAgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIH1cbiAgICBjdXJyZW50UXVldWUgPSBudWxsO1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgcnVuQ2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xufVxuXG5wcm9jZXNzLm5leHRUaWNrID0gZnVuY3Rpb24gKGZ1bikge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGggLSAxKTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHF1ZXVlLnB1c2gobmV3IEl0ZW0oZnVuLCBhcmdzKSk7XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCA9PT0gMSAmJiAhZHJhaW5pbmcpIHtcbiAgICAgICAgcnVuVGltZW91dChkcmFpblF1ZXVlKTtcbiAgICB9XG59O1xuXG4vLyB2OCBsaWtlcyBwcmVkaWN0aWJsZSBvYmplY3RzXG5mdW5jdGlvbiBJdGVtKGZ1biwgYXJyYXkpIHtcbiAgICB0aGlzLmZ1biA9IGZ1bjtcbiAgICB0aGlzLmFycmF5ID0gYXJyYXk7XG59XG5JdGVtLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5mdW4uYXBwbHkobnVsbCwgdGhpcy5hcnJheSk7XG59O1xucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5wcm9jZXNzLnZlcnNpb24gPSAnJzsgLy8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIHJlZ2V4cCBpc3N1ZXNcbnByb2Nlc3MudmVyc2lvbnMgPSB7fTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xucHJvY2Vzcy5wcmVwZW5kTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5wcmVwZW5kT25jZUxpc3RlbmVyID0gbm9vcDtcblxucHJvY2Vzcy5saXN0ZW5lcnMgPSBmdW5jdGlvbiAobmFtZSkgeyByZXR1cm4gW10gfVxuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xucHJvY2Vzcy51bWFzayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMDsgfTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qc1xuLy8gbW9kdWxlIGlkID0gMTVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIDEiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzQnVmZmVyKGFyZykge1xuICByZXR1cm4gYXJnICYmIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnXG4gICAgJiYgdHlwZW9mIGFyZy5jb3B5ID09PSAnZnVuY3Rpb24nXG4gICAgJiYgdHlwZW9mIGFyZy5maWxsID09PSAnZnVuY3Rpb24nXG4gICAgJiYgdHlwZW9mIGFyZy5yZWFkVUludDggPT09ICdmdW5jdGlvbic7XG59XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvdXRpbC9zdXBwb3J0L2lzQnVmZmVyQnJvd3Nlci5qc1xuLy8gbW9kdWxlIGlkID0gMTZcbi8vIG1vZHVsZSBjaHVua3MgPSAwIDEiLCJpZiAodHlwZW9mIE9iamVjdC5jcmVhdGUgPT09ICdmdW5jdGlvbicpIHtcbiAgLy8gaW1wbGVtZW50YXRpb24gZnJvbSBzdGFuZGFyZCBub2RlLmpzICd1dGlsJyBtb2R1bGVcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbmhlcml0cyhjdG9yLCBzdXBlckN0b3IpIHtcbiAgICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvclxuICAgIGN0b3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckN0b3IucHJvdG90eXBlLCB7XG4gICAgICBjb25zdHJ1Y3Rvcjoge1xuICAgICAgICB2YWx1ZTogY3RvcixcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcbn0gZWxzZSB7XG4gIC8vIG9sZCBzY2hvb2wgc2hpbSBmb3Igb2xkIGJyb3dzZXJzXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5oZXJpdHMoY3Rvciwgc3VwZXJDdG9yKSB7XG4gICAgY3Rvci5zdXBlcl8gPSBzdXBlckN0b3JcbiAgICB2YXIgVGVtcEN0b3IgPSBmdW5jdGlvbiAoKSB7fVxuICAgIFRlbXBDdG9yLnByb3RvdHlwZSA9IHN1cGVyQ3Rvci5wcm90b3R5cGVcbiAgICBjdG9yLnByb3RvdHlwZSA9IG5ldyBUZW1wQ3RvcigpXG4gICAgY3Rvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBjdG9yXG4gIH1cbn1cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL2luaGVyaXRzL2luaGVyaXRzX2Jyb3dzZXIuanNcbi8vIG1vZHVsZSBpZCA9IDE3XG4vLyBtb2R1bGUgY2h1bmtzID0gMCAxIiwiXHJcbnZhclxyXG4gIGRvd25FdmVudE5hbWUgPSBcImtleWRvd25cIixcclxuICB1cEV2ZW50TmFtZSA9IFwia2V5dXBcIjtcclxuXHJcbmNsYXNzIEtleVN0cm9rZUhhbmRsZXIge1xyXG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQsIHN0YXRlLCBidWZmZXIpIHtcclxuICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQsXHJcbiAgICAgIHRoaXMuc3RhdGUgPSBzdGF0ZSxcclxuICAgICAgdGhpcy5idWZmZXIgPSBidWZmZXI7XHJcblxyXG4gICAgICB0aGlzLmRvd25IYW5kbGVyID0gdGhpcy5kb3duSGFuZGxlci5iaW5kKHRoaXMpO1xyXG4gICAgICB0aGlzLnVwSGFuZGxlciA9IHRoaXMudXBIYW5kbGVyLmJpbmQodGhpcyk7XHJcbiAgICAgIFxyXG4gIH1cclxuXHJcbiAgZG93bkhhbmRsZXIoZXZlbnQpIHtcclxuICAgIHZhciBkVCA9IHRoaXMuc3RhdGUuZ2V0RFQoZXZlbnQsIDIwKTtcclxuICAgIHRoaXMuYnVmZmVyLnB1c2goWzIsIGRULCAxLCBldmVudC5rZXlDb2RlXSwgWzQsIDIwLCAxLCA1XSk7XHJcbiAgfVxyXG5cclxuICB1cEhhbmRsZXIoZXZlbnQpIHtcclxuICAgIHZhciBkVCA9IHRoaXMuc3RhdGUuZ2V0RFQoZXZlbnQsIDIwKTtcclxuXHJcbiAgICB0aGlzLmJ1ZmZlci5wdXNoKFsyLCBkVCwgMCwgZXZlbnQua2V5Q29kZV0sIFs0LCAyMCwgMSwgNV0pO1xyXG4gIH1cclxuXHJcbiAgc3RhcnQoKSB7XHJcbiAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihkb3duRXZlbnROYW1lLCB0aGlzLmRvd25IYW5kbGVyKTtcclxuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKHVwRXZlbnROYW1lLCB0aGlzLnVwSGFuZGxlcik7XHJcbiAgfTtcclxuXHJcbiAgc3RvcCgpIHtcclxuICAgIHRoaXMuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGRvd25FdmVudE5hbWUsIHRoaXMuZG93bkhhbmRsZXIpO1xyXG4gICAgdGhpcy5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIodXBFdmVudE5hbWUsIHRoaXMudXBIYW5kbGVyKTtcclxuICB9O1xyXG5cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgS2V5U3Ryb2tlSGFuZGxlcjtcblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMva2V5U3Ryb2tlSGFuZGxlci5qcyIsImltcG9ydCBDSVRyYXAgZnJvbSBcIi4vLi4vc3JjXCJcclxuXHJcblxyXG52YXIgY2lUcmFwID0gbmV3IENJVHJhcCgpO1xyXG5cclxud2luZG93Lm9ubG9hZCA9ICgpID0+IHtcclxuICAgIHZhciBzdGFydEJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3RhcnRcIik7XHJcbiAgICB2YXIgc3RvcEJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3RvcFwiKTtcclxuICAgIHZhciBzaG93QnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzaG93XCIpO1xyXG4gICAgdmFyIGJ1ZmZlckRpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYnVmZmVyXCIpO1xyXG5cclxuXHJcbiAgICBzdGFydEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICAgIGNpVHJhcC5zdGFydCgpO1xyXG4gICAgfSlcclxuXHJcbiAgICBzdG9wQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgY2lUcmFwLnN0b3AoKTtcclxuICAgIH0pXHJcblxyXG4gICAgc2hvd0J1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICAgIGJ1ZmZlckRpdi5pbm5lckhUTUwgPSBjaVRyYXAuYnVmZmVyKCk7XHJcbiAgICB9KVxyXG59XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vZXhhbXBsZS9hcHAuanMiXSwic291cmNlUm9vdCI6IiJ9