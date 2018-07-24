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

//  import  MouseWheelHandler = from './mouseWheelHandler.js'

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

var _util2 = _interopRequireDefault(_util);

var _keyStrokeHandler = __webpack_require__(18);

var _keyStrokeHandler2 = _interopRequireDefault(_keyStrokeHandler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CITrap = function () {
  function CITrap() {
    var element = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : window.document;
    var idleTimeout = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

    _classCallCheck(this, CITrap);

    var windowAlias = window;
    var documentAlias = window.document;
    var undefinedAlias;

    var windowSupport = element === windowAlias || element === documentAlias;
    var touchSupport = 'ontouchstart' in windowAlias || 'onmsgesturechange' in windowAlias; // works on ie10

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
    key: 'start',
    value: function start(options) {
      if (this.running) {
        return;
      }
      options = options || {};
      var length = this.handlers.length;
      for (var i = 0; i < length; i++) {
        if (this.handlers[i] !== _util2.default && typeof this.handlers[i].start === 'function') {
          this.handlers[i].start(options);
        }
      }
      this.running = true;
    }

    /**
     *  Stops event processing.
     */

  }, {
    key: 'stop',
    value: function stop() {
      if (!this.running) {
        return;
      }
      var length = this.handlers.length;
      for (var i = 0; i < length; i++) {
        if (this.handlers[i] !== _util2.default && typeof this.handlers[i].stop === 'function') {
          this.handlers[i].stop();
        }
      }
      this.running = false;
    }
  }, {
    key: 'buffer',
    value: function buffer() {
      return this.transport.getBuffer();
    }
  }, {
    key: 'send',
    value: function send() {
      return this.transport.send.apply(this, arguments);
    }
  }, {
    key: 'setHeader',
    value: function setHeader() {
      return this.transport.setHeader.apply(this, arguments);
    }
  }, {
    key: 'setUrl',
    value: function setUrl() {
      return this.transport.setUrl.apply(this, arguments);
    }
  }, {
    key: 'setSessionID',
    value: function setSessionID() {
      return this.transport.setSessionID.apply(this, arguments);
    }
  }, {
    key: 'mark',
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

    this.window = window;
    this.transport = transport;
    this.idleTimeout = idleTimeout;

    this.getDT = this.getDT.bind(this);
    this.idleHandler = this.idleHandler.bind(this);

    if (idleTimeout !== 0) {
      this.idleHandler();
    }
  }

  _createClass(State, [{
    key: 'idleHandler',
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
    key: 'getDT',
    value: function getDT(event, bits) {
      var round = Math.round;
      var currentTs = event && typeof event.timeStamp === 'number' && event.timeStamp || new Date().getTime();
      var dT;

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
    key: 'lastTs',
    value: function lastTs() {
      return _lastTs;
    }
  }, {
    key: 'start',
    value: function start() {
      // noop
    }
  }, {
    key: 'stop',
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

var eventName = 'ct:state';

var StateHandler = function () {
  function StateHandler(window, document, element, state, buffer) {
    _classCallCheck(this, StateHandler);

    this.window = window;
    this.document = document;
    this.element = element;
    this.state = state;
    this.buffer = buffer;

    this.handler = this.handler.bind(this);
  }
  /*
   * State event handler.
   */


  _createClass(StateHandler, [{
    key: 'handler',
    value: function handler(event) {
      var dT = this.state.getDT(event, 20);

      this.buffer.push([15, dT, this.state.lastTs(), // 0b1111 <time-difference:20b> <current-time-stamp:42b>
      this.state.mouseScreenX, this.state.mouseScreenY, // <mouse-screen-x:18b> <mouse-screen-y:18b>
      // state.cX, state.cY, // <mouse-client-x:18b> <mouse-client-y:18b>
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
    key: 'trigger',
    value: function trigger() {
      var stateEvent = this.document.createEvent('CustomEvent');
      stateEvent.initEvent(eventName, true, false);
      this.element.dispatchEvent(stateEvent);
    }
  }, {
    key: 'start',
    value: function start(options) {
      this.element.addEventListener(eventName, this.handler, false);
      if (options.initialState === true) {
        this.trigger();
      }
    }
  }, {
    key: 'stop',
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
var startEventName = 'touchstart';
var endEventName = 'touchend';
var moveEventName = 'touchmove';

var touchIdToId = [];

var TouchHandler = function () {
  function TouchHandler(element, state, buffer) {
    _classCallCheck(this, TouchHandler);

    this.element = element;
    this.state = state;
    this.buffer = buffer;

    this.startHandler = this.startHandler.bind(this);
    this.moveHandler = this.moveHandler.bind(this);
    this.endHandler = this.endHandler.bind(this);
  }
  // finds an existing (or free) id for given touchId, starting from 0.


  _createClass(TouchHandler, [{
    key: 'resolveId',
    value: function resolveId(touchId) {
      var firstFree;
      var length = touchIdToId.length;
      for (var i = 0; i < length; i++) {
        if (touchIdToId[i] === touchId) {
          return i;
        }
        if (touchIdToId[i] === undefined) {
          firstFree = firstFree || i;
        }
      }
      if (typeof firstFree === 'number') {
        touchIdToId[firstFree] = touchId;
        return firstFree;
      } else {
        touchIdToId.push(touchId);
        return length;
      }
    }
  }, {
    key: 'removeId',


    // removes touchId from list.
    value: function removeId(touchId) {
      var length = touchIdToId.length;
      var i = 0;
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
    key: 'startHandler',
    value: function startHandler(event) {
      var dT = this.state.getDT(event, 20);
      var changedTouches = event.changedTouches;
      var length = changedTouches.length;

      for (var i = 0; i < length; i++) {
        var ev = changedTouches[i];
        var id = this.resolveId(ev.identifier);
        this.buffer.push([3, dT, 1, id, ev.screenX, ev.screenY], [4, 20, 1, 5, 18, 18]);
        dT = 0; // next
      }

      return true;
    }
  }, {
    key: 'endHandler',
    value: function endHandler(event) {
      var dT = this.state.getDT(event, 20);
      var changedTouches = event.changedTouches;
      var length = changedTouches.length;

      for (var i = 0; i < length; i++) {
        var ev = changedTouches[i];
        var id = this.resolveId(ev.identifier);
        this.buffer.push([3, dT, 0, id, ev.screenX, ev.screenY], [4, 20, 1, 5, 18, 18]);

        this.removeId(ev.identifier);

        dT = 0; // next
      }

      return true;
    }
  }, {
    key: 'moveHandler',
    value: function moveHandler(event) {
      var dT = this.state.getDT(event, 20);
      var changedTouches = event.changedTouches;
      var length = changedTouches.length;

      for (var i = 0; i < length; i++) {
        var ev = changedTouches[i];
        var id = this.resolveId(ev.identifier);
        this.buffer.push([1, dT, 0, id, ev.screenX, ev.screenY], [4, 20, 1, 5, 18, 18]);
        dT = 0; // next
      }

      return true;
    }
  }, {
    key: 'start',
    value: function start() {
      this.element.addEventListener(startEventName, this.startHandler);
      this.element.addEventListener(moveEventName, this.moveHandler);
      this.element.addEventListener(endEventName, this.endHandler);
    }
  }, {
    key: 'stop',
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

var eventName = 'ct:mark';
var defaultText = 'marker';

var MarkerHandler = function () {
  function MarkerHandler(window, document, element, state, buffer) {
    _classCallCheck(this, MarkerHandler);

    this.window = window;
    this.document = document;
    this.element = element;
    this.state = state;
    this.buffer = buffer;

    this.handler = this.handler.bind(this);
  }

  _createClass(MarkerHandler, [{
    key: 'handler',
    value: function handler(event) {
      var dT = this.state.getDT(event, 20);
      var text = event && event.text || defaultText;

      this.buffer.push([14, dT], [4, 20]);
      this.buffer.pushRawBytes(text);
    }
  }, {
    key: 'trigger',
    value: function trigger(text) {
      var markEvent = this.document.createEvent('CustomEvent');
      markEvent.initEvent(eventName, true, false);
      markEvent.text = text || 'mark';
      this.element.dispatchEvent(markEvent);
    }
  }, {
    key: 'start',
    value: function start() {
      this.element.addEventListener(eventName, this.handler, false);
    }
  }, {
    key: 'stop',
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
eventName = 'mousemove';

// TODO: http://www.jacklmoore.com/notes/mouse-position/

var MouseMoveHandler = function () {
  function MouseMoveHandler(element, state, buffer) {
    _classCallCheck(this, MouseMoveHandler);

    this.element = element;
    this.state = state;
    this.buffer = buffer;

    this.handler = this.handler.bind(this);
  }

  _createClass(MouseMoveHandler, [{
    key: 'handler',
    value: function handler(event) {
      var dT = this.state.getDT(event, 20);
      var sX = event.screenX;
      var sY = event.screenY;

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
    key: 'start',
    value: function start() {
      // TODO: Something more accurate is needed.
      this.state.mouseScreenX = this.state.mouseScreenX || 0;
      this.state.mouseScreenY = this.state.mouseScreenY || 0;

      this.element.addEventListener(eventName, this.handler);
    }
  }, {
    key: 'stop',
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

var downEventName = 'mousedown';
var upEventName = 'mouseup';

var MouseButtonHandler = function () {
  function MouseButtonHandler(element, state, buffer) {
    _classCallCheck(this, MouseButtonHandler);

    this.element = element;
    this.state = state;
    this.buffer = buffer;

    this.downHandler = this.downHandler.bind(this);
    this.upHandler = this.upHandler.bind(this);
  }

  _createClass(MouseButtonHandler, [{
    key: 'button',
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
    key: 'downHandler',
    value: function downHandler(event) {
      var dT = this.state.getDT(event, 20);
      var sX = event.screenX;
      var sY = event.screenY;
      this.buffer.push([2, dT, sX, sY, 0, this.button(event)], [4, 20, 18, 18, 1, 5]);
    }
  }, {
    key: 'upHandler',
    value: function upHandler(event) {
      var dT = this.state.getDT(event, 20);
      var sX = event.screenX;
      var sY = event.screenY;
      this.buffer.push([2, dT, sX, sY, 0, this.button(event)], [4, 20, 18, 18, 1, 5]);
    }
  }, {
    key: 'start',
    value: function start() {
      this.element.addEventListener(downEventName, this.downHandler);
      this.element.addEventListener(upEventName, this.upHandler);
    }
  }, {
    key: 'stop',
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

var abs = Math.abs;
var eventName = 'scroll';

// TODO simplify/check this handler

var PageScrollHandler = function () {
  function PageScrollHandler(element, state, buffer) {
    _classCallCheck(this, PageScrollHandler);

    this.element = element;
    this.state = state;
    this.buffer = buffer;

    this.handler = this.handler.bind(this);
  }

  _createClass(PageScrollHandler, [{
    key: 'handler',
    value: function handler(event) {
      var pX;
      var pY;
      var dX;
      var dY;
      var signDX;
      var signDY;
      var absDX;
      var absDY;

      var dT = this.state.getDT(event, 20);

      // Scroll X/Y on current page
      if ('pageXOffset' in this.element && this.element.document) {
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
    key: 'start',
    value: function start() {
      // Scroll X/Y on current page
      if ('pageXOffset' in this.element && this.element.document) {
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
    key: 'stop',
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

var delay = 1000 / 15; // 15fps
var _timeout;

var WindowSizeHandler = function () {
  function WindowSizeHandler(window, state, buffer) {
    _classCallCheck(this, WindowSizeHandler);

    this.window = window;
    this.state = state;
    this.buffer = buffer;

    this.throttler = this.throttler.bind(this);
  }

  _createClass(WindowSizeHandler, [{
    key: 'handler',
    value: function handler(event) {
      var w = this.window.innerWidth;
      var h = this.window.innerHeight;
      var dT = this.state.getDT(event, 20);

      // type = 0b1000
      this.buffer.push([8, dT, w, h], [4, 20, 15, 15]);
    }
  }, {
    key: 'throttler',
    value: function throttler(event) {
      var _this = this;

      if (_timeout) {
        this.window.clearTimeout(this.timeout());
      }

      _timeout = function timeout() {
        var self = _this;
        window.setTimeout(function () {
          _timeout = null;
          self.handler(event);
        }, delay);
      };
    }
  }, {
    key: 'start',
    value: function start() {
      this.state.wW = this.window.innerWidth;
      this.state.wH = this.window.innerHeight;
      this.window.addEventListener('resize', this.throttler, false);
    }
  }, {
    key: 'stop',
    value: function stop() {
      this.window.removeEventListener('resize', this.throttler, false);
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

var eventName = 'positionchanged';
var longDelay = 1000 / 2; // 2fps
var shortDelay = 1000 / 15; // 15fps
var throttleBase = 15; // it's a "constant"
var throttleCount = throttleBase;
var timeout;

var WindowPositionHandler = function () {
  function WindowPositionHandler(window, document, state, buffer) {
    _classCallCheck(this, WindowPositionHandler);

    this.window = window;
    this.document = document;
    this.state = state;
    this.buffer = buffer;

    this.handler = this.handler.bind(this);
    this.poller = this.poller.bind(this);
  }

  _createClass(WindowPositionHandler, [{
    key: 'windowPositionX',
    value: function windowPositionX() {
      return this.window.screenX || this.window.screenLeft || 0;
    }
  }, {
    key: 'windowPositionY',
    value: function windowPositionY() {
      return this.window.screenY || this.window.screenTop || 0;
    }
  }, {
    key: 'handler',
    value: function handler(event) {
      var dT = this.state.getDT(null, 20);

      this.state.windowPositionX = event.x;
      this.state.windowPositionY = event.y;

      // type = 0b1001
      this.buffer.push([9, dT, event.x, event.y], [4, 20, 15, 15]);
    }
  }, {
    key: 'poller',
    value: function poller() {
      var x = this.windowPositionX();
      var y = this.windowPositionY();

      if (this.state.windowPositionX !== x || this.state.windowPositionY !== y) {
        var event = this.document.createEvent('CustomEvent');
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
    key: 'startPoller',
    value: function startPoller() {
      this.window.setTimeout(this.poller, longDelay);
    }
  }, {
    key: 'stopPoller',
    value: function stopPoller() {
      if (timeout) {
        this.window.clearTimeout(timeout);
      }
    }
  }, {
    key: 'start',
    value: function start() {
      this.state.windowPositionX = this.windowPositionX();
      this.state.windowPositionY = this.windowPositionY();
      this.window.addEventListener(eventName, this.handler, false);
      this.startPoller();
    }
  }, {
    key: 'stop',
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

var eventName = 'beforeunload';

var WindowUnloadHandler = function () {
  function WindowUnloadHandler(window, state, buffer) {
    _classCallCheck(this, WindowUnloadHandler);

    this.window = window;
    this.state = state;
    this.buffer = buffer;

    this.handler = this.handler.bind(this);
  }

  _createClass(WindowUnloadHandler, [{
    key: 'handler',
    value: function handler(event) {
      var dT = this.state.getDT(event, 20);

      // 0b1001
      this.buffer.push([12, dT], [4, 20]);
    }
  }, {
    key: 'start',
    value: function start() {
      this.window.addEventListener(eventName, this.handler, false);
    }
  }, {
    key: 'stop',
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

var stateKey;
var eventKey;

var keys = {
  hidden: 'visibilitychange',
  webkitHidden: 'webkitvisibilitychange',
  mozHidden: 'mozvisibilitychange',
  msHidden: 'msvisibilitychange'
};

var VisibilityChangeHandler = function () {
  function VisibilityChangeHandler(window, state, buffer) {
    _classCallCheck(this, VisibilityChangeHandler);

    this.window = window;
    this.state = state;
    this.buffer = buffer;

    for (stateKey in keys) {
      if (stateKey in window.document) {
        eventKey = keys[stateKey];
        break;
      }
    }

    this.handler = this.handler.bind(this);
  }

  _createClass(VisibilityChangeHandler, [{
    key: 'handler',
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
    key: 'start',
    value: function start() {
      window.addEventListener(eventKey, this.handler, false);
    }
  }, {
    key: 'stop',
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

var map = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

// @constant
var head = 'BB'; // v2 :)

// buffer

// Locals.
var url = '/s';
var headers = {};
var sessionID;
var counter = 1;

var Transport = function () {
  function Transport(window) {
    _classCallCheck(this, Transport);

    this.window = window;
    this.encodeWrapper = window.encodeURIComponent;
    this.buffer = '';
    this.send = this.send.bind(this);
  }

  _createClass(Transport, [{
    key: 'encodeValues',
    value: function encodeValues(values, sizes) {
      var idx;
      var len = values.length;
      var bc = 0; // bit counter
      var cv; // current value
      var av = 0; // actual value
      var size;
      var results = '';

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
    key: 'encodeHeaders',
    value: function encodeHeaders(headers) {
      var headerString = '';

      for (var key in headers) {
        if (headers.hasOwnProperty(key)) {
          headerString = headerString + this.encodeWrapper(key) + '=' + this.encodeWrapper(headers[key]) + ',';
        }
      }

      return this.encodeValues([headerString.length], [12]) + headerString;
    }
  }, {
    key: 'reset',


    /*
     * @private
     * Resets buffer.
     */
    value: function reset() {
      this.buffer = '';
      return true;
    }

    /*
     * @private
     * Shifts available data.  That means resetting to its defaults and returning
     * already collected events.
     */

  }, {
    key: 'shift',
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
    key: 'encodeRawBytes',
    value: function encodeRawBytes(bytes) {
      var encoded = this.encodeWrapper(bytes);
      return this.encodeValues([encoded.length], [12]) + encoded;
    }
  }, {
    key: 'send',
    value: function send(sync, callback) {
      try {
        var x = new window.XMLHttpRequest();
        x.open('POST', url, true);
        x.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        x.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        x.onreadystatechange = function () {
          // Call a function when the state changes.
          if (callback) {
            callback(x);
          }
        };

        headers['stream-id'] = sessionID + '.' + counter++;
        x.send(head + this.encodeHeaders(headers) + this.shift());
      } catch (e) {
        window.console && console.log(e);
      }
    }
  }, {
    key: 'setUrl',

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
    key: 'setHeader',


    /**
     * Sets request header k/v pair.
     */
    value: function setHeader(key, value) {
      headers[key] = value;
    }
  }, {
    key: 'setSessionID',


    /**
     * Sets session ID for this session.
     */
    value: function setSessionID(s) {
      sessionID = s;
    }
  }, {
    key: 'getBuffer',


    /**
     * Returns current buffer contents (without version magic and headers).
     */
    value: function getBuffer() {
      return this.buffer;
    }
  }, {
    key: 'push',


    /**
     * Encodes and pushes values sampled by its given size into buffer.
     */
    value: function push(values, sizes) {
      this.buffer += this.encodeValues(values, sizes);
      return this.buffer;
    }
  }, {
    key: 'pushRawBytes',


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

var downEventName = 'keydown';
var upEventName = 'keyup';

var KeyStrokeHandler = function () {
  function KeyStrokeHandler(element, state, buffer) {
    _classCallCheck(this, KeyStrokeHandler);

    this.element = element;
    this.state = state;
    this.buffer = buffer;

    this.downHandler = this.downHandler.bind(this);
    this.upHandler = this.upHandler.bind(this);
  }

  _createClass(KeyStrokeHandler, [{
    key: 'downHandler',
    value: function downHandler(event) {
      var dT = this.state.getDT(event, 20);
      this.buffer.push([2, dT, 1, event.keyCode], [4, 20, 1, 5]);
    }
  }, {
    key: 'upHandler',
    value: function upHandler(event) {
      var dT = this.state.getDT(event, 20);

      this.buffer.push([2, dT, 0, event.keyCode], [4, 20, 1, 5]);
    }
  }, {
    key: 'start',
    value: function start() {
      this.element.addEventListener(downEventName, this.downHandler);
      this.element.addEventListener(upEventName, this.upHandler);
    }
  }, {
    key: 'stop',
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


var _index = __webpack_require__(0);

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ciTrap = new _index2.default();

window.onload = function () {
  var startButton = document.getElementById('start');
  var stopButton = document.getElementById('stop');
  var showButton = document.getElementById('show');
  var bufferDiv = document.getElementById('buffer');

  startButton.addEventListener('click', function () {
    ciTrap.start();
  });

  stopButton.addEventListener('click', function () {
    ciTrap.stop();
  });

  showButton.addEventListener('click', function () {
    bufferDiv.innerHTML = ciTrap.buffer();
  });
};

/***/ })
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgMDEyN2QyMWZjYWFjYmYyMzI0NGYiLCJ3ZWJwYWNrOi8vLy4vc3JjL2luZGV4LmpzIiwid2VicGFjazovLy8uL3NyYy9zdGF0ZS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvc3RhdGVoYW5kbGVyLmpzIiwid2VicGFjazovLy8uL3NyYy90b3VjaEhhbmRsZXIuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL21hcmtlckhhbmRsZXIuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL21vdXNlTW92ZUhhbmRsZXIuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL21vdXNlQnV0dG9uSGFuZGxlci5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvcGFnZVNjcm9sbEhhbmRsZXIuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3dpbmRvd1NpemVIYW5kbGVyLmpzIiwid2VicGFjazovLy8uL3NyYy93aW5kb3dQb3NpdGlvbkhhbmRsZXIuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3dpbmRvd1VubG9hZEhhbmRsZXIuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3Zpc2liaWxpdHlDaGFuZ2VIYW5kbGVyLmpzIiwid2VicGFjazovLy8uL3NyYy90cmFuc3BvcnQuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL3V0aWwvdXRpbC5qcyIsIndlYnBhY2s6Ly8vKHdlYnBhY2spL2J1aWxkaW4vZ2xvYmFsLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL3V0aWwvc3VwcG9ydC9pc0J1ZmZlckJyb3dzZXIuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2luaGVyaXRzL2luaGVyaXRzX2Jyb3dzZXIuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2tleVN0cm9rZUhhbmRsZXIuanMiLCJ3ZWJwYWNrOi8vLy4vZXhhbXBsZS9hcHAuanMiXSwibmFtZXMiOlsiQ0lUcmFwIiwiZWxlbWVudCIsIndpbmRvdyIsImRvY3VtZW50IiwiaWRsZVRpbWVvdXQiLCJ3aW5kb3dBbGlhcyIsImRvY3VtZW50QWxpYXMiLCJ1bmRlZmluZWRBbGlhcyIsIndpbmRvd1N1cHBvcnQiLCJ0b3VjaFN1cHBvcnQiLCJydW5uaW5nIiwidHJhbnNwb3J0IiwiVHJhbnNwb3J0Iiwic3RhdGUiLCJTdGF0ZSIsImhhbmRsZXJzIiwiQXJyYXkiLCJtYXJrZXJIYW5kbGVyIiwiTWFya2VySGFuZGxlciIsInB1c2giLCJTdGF0ZUhhbmRsZXIiLCJNb3VzZU1vdmVIYW5kbGVyIiwiTW91c2VCdXR0b25IYW5kbGVyIiwiS2V5U3Ryb2tlSGFuZGxlciIsIlBhZ2VTY3JvbGxIYW5kbGVyIiwiV2luZG93U2l6ZUhhbmRsZXIiLCJXaW5kb3dQb3NpdGlvbkhhbmRsZXIiLCJXaW5kb3dVbmxvYWRIYW5kbGVyIiwiVmlzaWJpbGl0eUNoYW5nZUhhbmRsZXIiLCJUb3VjaEhhbmRsZXIiLCJzdGFydCIsImJpbmQiLCJzdG9wIiwib3B0aW9ucyIsImxlbmd0aCIsImkiLCJpc051bGxPclVuZGVmaW5lZCIsImdldEJ1ZmZlciIsInNlbmQiLCJhcHBseSIsImFyZ3VtZW50cyIsInNldEhlYWRlciIsInNldFVybCIsInNldFNlc3Npb25JRCIsInRleHQiLCJ0cmlnZ2VyIiwiaWRsZVRpbWVyIiwiZXBvY2hUcyIsImxhc3RUcyIsImdldERUIiwiaWRsZUhhbmRsZXIiLCJldmVudCIsImJpdHMiLCJyb3VuZCIsIk1hdGgiLCJjdXJyZW50VHMiLCJ0aW1lU3RhbXAiLCJEYXRlIiwiZ2V0VGltZSIsImRUIiwiY2xlYXJUaW1lb3V0IiwidW5kZWZpbmVkIiwic2V0VGltZW91dCIsIm1heCIsImV2ZW50TmFtZSIsImJ1ZmZlciIsImhhbmRsZXIiLCJtb3VzZVNjcmVlblgiLCJtb3VzZVNjcmVlblkiLCJwYWdlU2Nyb2xsWCIsInBhZ2VTY3JvbGxZIiwiaW5uZXJXaWR0aCIsImlubmVySGVpZ2h0Iiwib3V0ZXJXaWR0aCIsIm91dGVySGVpZ2h0Iiwic2NyZWVuWCIsInNjcmVlbkxlZnQiLCJzY3JlZW5ZIiwic2NyZWVuVG9wIiwic2NyZWVuIiwid2lkdGgiLCJoZWlnaHQiLCJzdGF0ZUV2ZW50IiwiY3JlYXRlRXZlbnQiLCJpbml0RXZlbnQiLCJkaXNwYXRjaEV2ZW50IiwiYWRkRXZlbnRMaXN0ZW5lciIsImluaXRpYWxTdGF0ZSIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJzdGFydEV2ZW50TmFtZSIsImVuZEV2ZW50TmFtZSIsIm1vdmVFdmVudE5hbWUiLCJ0b3VjaElkVG9JZCIsInN0YXJ0SGFuZGxlciIsIm1vdmVIYW5kbGVyIiwiZW5kSGFuZGxlciIsInRvdWNoSWQiLCJmaXJzdEZyZWUiLCJwb3AiLCJjaGFuZ2VkVG91Y2hlcyIsImV2IiwiaWQiLCJyZXNvbHZlSWQiLCJpZGVudGlmaWVyIiwicmVtb3ZlSWQiLCJkZWZhdWx0VGV4dCIsInB1c2hSYXdCeXRlcyIsIm1hcmtFdmVudCIsInNYIiwic1kiLCJkb3duRXZlbnROYW1lIiwidXBFdmVudE5hbWUiLCJkb3duSGFuZGxlciIsInVwSGFuZGxlciIsImJiIiwid2hpY2giLCJiIiwiYnV0dG9uIiwiYWJzIiwicFgiLCJwWSIsImRYIiwiZFkiLCJzaWduRFgiLCJzaWduRFkiLCJhYnNEWCIsImFic0RZIiwiZG9jIiwiZG9jdW1lbnRFbGVtZW50IiwicGFnZVhPZmZzZXQiLCJzY3JvbGxMZWZ0IiwiY2xpZW50TGVmdCIsInBhZ2VZT2Zmc2V0Iiwic2Nyb2xsVG9wIiwiY2xpZW50VG9wIiwicGFnZVgiLCJwYWdlWSIsImRlbGF5IiwidGltZW91dCIsInRocm90dGxlciIsInciLCJoIiwic2VsZiIsIndXIiwid0giLCJsb25nRGVsYXkiLCJzaG9ydERlbGF5IiwidGhyb3R0bGVCYXNlIiwidGhyb3R0bGVDb3VudCIsInBvbGxlciIsIndpbmRvd1Bvc2l0aW9uWCIsIngiLCJ3aW5kb3dQb3NpdGlvblkiLCJ5Iiwic3RhcnRQb2xsZXIiLCJzdG9wUG9sbGVyIiwic3RhdGVLZXkiLCJldmVudEtleSIsImtleXMiLCJoaWRkZW4iLCJ3ZWJraXRIaWRkZW4iLCJtb3pIaWRkZW4iLCJtc0hpZGRlbiIsIm1hcCIsImhlYWQiLCJ1cmwiLCJoZWFkZXJzIiwic2Vzc2lvbklEIiwiY291bnRlciIsImVuY29kZVdyYXBwZXIiLCJlbmNvZGVVUklDb21wb25lbnQiLCJ2YWx1ZXMiLCJzaXplcyIsImlkeCIsImxlbiIsImJjIiwiY3YiLCJhdiIsInNpemUiLCJyZXN1bHRzIiwiaGVhZGVyU3RyaW5nIiwia2V5IiwiaGFzT3duUHJvcGVydHkiLCJlbmNvZGVWYWx1ZXMiLCJjb250ZW50cyIsInJlc2V0IiwiYnl0ZXMiLCJlbmNvZGVkIiwic3luYyIsImNhbGxiYWNrIiwiWE1MSHR0cFJlcXVlc3QiLCJvcGVuIiwic2V0UmVxdWVzdEhlYWRlciIsIm9ucmVhZHlzdGF0ZWNoYW5nZSIsImVuY29kZUhlYWRlcnMiLCJzaGlmdCIsImUiLCJjb25zb2xlIiwibG9nIiwidSIsInZhbHVlIiwicyIsImVuY29kZVJhd0J5dGVzIiwia2V5Q29kZSIsImNpVHJhcCIsIm9ubG9hZCIsInN0YXJ0QnV0dG9uIiwiZ2V0RWxlbWVudEJ5SWQiLCJzdG9wQnV0dG9uIiwic2hvd0J1dHRvbiIsImJ1ZmZlckRpdiIsImlubmVySFRNTCJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkIsMEJBQTBCLEVBQUU7QUFDdkQseUNBQWlDLGVBQWU7QUFDaEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOERBQXNELCtEQUErRDs7QUFFckg7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7Ozs7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QUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBOzs7QUFHQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSw0Q0FBNEMsS0FBSzs7QUFFakQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0EsS0FBSztBQUNMOztBQUVBOztBQUVBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTtBQUNBLG1DQUFtQyxPQUFPO0FBQzFDO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQSx5REFBeUQ7QUFDekQ7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1gsU0FBUztBQUNUO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOzs7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBOzs7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLFNBQVM7QUFDcEI7QUFDQSxXQUFXLFNBQVM7QUFDcEI7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7Ozs7OztBQ3prQkE7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsQ0FBQzs7QUFFRDtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLDRDQUE0Qzs7QUFFNUM7Ozs7Ozs7QUNwQkE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBOzs7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FBSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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LGFBQWE5TSxTQUFTNE0sY0FBVCxDQUF3QixNQUF4QixDQUFqQjtBQUNBLE1BQUlHLFlBQVkvTSxTQUFTNE0sY0FBVCxDQUF3QixRQUF4QixDQUFoQjs7QUFFQUQsY0FBWXhILGdCQUFaLENBQTZCLE9BQTdCLEVBQXNDLFlBQU07QUFDMUNzSCxXQUFPOUssS0FBUDtBQUNELEdBRkQ7O0FBSUFrTCxhQUFXMUgsZ0JBQVgsQ0FBNEIsT0FBNUIsRUFBcUMsWUFBTTtBQUN6Q3NILFdBQU81SyxJQUFQO0FBQ0QsR0FGRDs7QUFJQWlMLGFBQVczSCxnQkFBWCxDQUE0QixPQUE1QixFQUFxQyxZQUFNO0FBQ3pDNEgsY0FBVUMsU0FBVixHQUFzQlAsT0FBTzNJLE1BQVAsRUFBdEI7QUFDRCxHQUZEO0FBR0QsQ0FqQkQsQyIsImZpbGUiOiIuL2V4YW1wbGUvZGlzdC9idW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbiBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbiBcdFx0XHR9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSAxOSk7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgMDEyN2QyMWZjYWFjYmYyMzI0NGYiLCIvLyAhIGNpLXRyYXAgdjAuMi4wIC0gTUlUIGxpY2Vuc2VcclxuLy8gTW90aW9uIGV2ZW50IChtb3VzZSBtb3ZlbWVudCkgY2F0Y2hlciBmb3IgYnJvd3NlcnMgZW1pdHRpbmcgZGF0YSBjb21wYXRpYmxlXHJcbi8vIHdpdGggQ3Vyc29yIEluc2lnaHQncyBtb3Rpb24gYW5hbHl6ZXIgZW5naW5lLiAodG91Y2gsIGd5cm8sIGV0Yy4gaXMgV0lQKVxyXG5cclxuLy8gQ29weXJpZ2h0IChjKSAyMDEyLS0yMDE0LCBHT0xEQSBCZW5jZSA8Z2JlbmNlQGFsZ2Vybm9uLmh1PlxyXG4vLyAgICAgICAgICAgICAgICAgICAgIDIwMTQsIEdPTERBIEJlbmNlIDxiZW5jZUBjdXJzb3JpbnNpZ2h0LmNvbT5cclxuLy8gICAgICAgICAgICAgICAgICAgICAyMDE0LCBUw5ZSVEVMSSBPbGl2w6lyIDxvbGl2ZXJAY3Vyc29yaW5zaWdodC5jb20+XHJcblxyXG4vLyAjIERhdGEgZm9ybWF0IChpbiB+Qk5GKSAjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcclxuXHJcbi8vICAgIDxkYXRhPiA6Oj0gPHZlcnNpb24+IDxoZWFkZXJzPiA8ZXZlbnRzPlxyXG4vLyA8aGVhZGVycz4gOjo9IDxoZWFkZXItc2l6ZToxMmI+IDx1cmwtZW5jb2RlZC1zdHJpbmc6PGhlYWRlci1zaXplIGluIGJ5dGVzPj5cclxuLy8gIDxldmVudHM+IDo6PSA8ZXZlbnQ+IDxldmVudHM+IHwgRU9TXHJcbi8vICAgPGV2ZW50PiA6Oj0gPG1vdXNlLW1vdmU+IHwgPG1vdXNlLWJ1dHRvbj5cclxuLy8gICAgICAgICAgICB8IDx0b3VjaC1tb3ZlPiB8IDx0b3VjaC1jaGFuZ2U+XHJcbi8vICAgICAgICAgICAgIHwgPHNjcm9sbC1jaGFuZ2U+XHJcbi8vICAgICAgICAgICAgIHwgPG1vdXNlLXdoZWVsLXg+IHwgPG1vdXNlLXdoZWVsLXk+XHJcbi8vICAgICAgICAgICAgIHwgPHdpbmRvdy1zaXplLWNoYW5nZT4gfCA8d2luZG93LXBvc2l0aW9uLWNoYW5nZT5cclxuLy8gICAgICAgICAgICAgfCA8dmlzaWJpbGl0eS1jaGFuZ2U+IHwgPHVubG9hZD5cclxuLy8gICAgICAgICAgICAgfCA8bWFya2VyPiB8IDxzdGF0ZT5cclxuXHJcbi8vIC8vIHRoaXMgaXMgKGFuZCB3aWxsIGJlKSBhbHdheXMgYSBjb25zdGFudCBhbmQgYSB2ZXJzaW9uIGlkXHJcbi8vIDx2ZXJzaW9uPiAgICAgICAgOjo9IFwiQlwiIDx2ZXJzaW9uLWxldHRlcj5cclxuLy8gPHZlcnNpb24tbGV0dGVyPiA6Oj0gXCJBXCIgfCBcIkJcIiB8IFwiQ1wiIHwgXCJEXCIgLi4uXHJcblxyXG4vLyAvLyBzdW06IDYwYlxyXG4vLyA8bW91c2UtbW92ZT4gOjo9IDBiMDAwMCA8dGltZS1kaWZmZXJlbmNlOjIwYj5cclxuLy8gICAgICAgICAgICAgICAgICA8bW91c2Utc2NyZWVuLXg6MThiPiA8bW91c2Utc2NyZWVuLXk6MThiPlxyXG5cclxuLy8gPHRvdWNoLW1vdmU+IDo6PSAwYjAwMDEgPHRpbWUtZGlmZmVyZW5jZToyMGI+XHJcbi8vICAgICAgICAgICAgICAgICAgPGVtcHR5OjFiPiA8dG91Y2gtaWQ6NWI+XHJcbi8vICAgICAgICAgICAgICAgICAgPHRvdWNoLXNjcmVlbi14OjE4Yj4gPHRvdWNoLXNjcmVlbi15OjE4Yj5cclxuXHJcbi8vIFRPRE86IHJldHVybiBvbmx5IHRoZSBkaWZmZXJlbmNlcyBhbmQgcHV0IFwibWFya2Vyc1wiIChhcyBmdWxsIGZyYW1lcyBpblxyXG4vLyB2aWRlbykgaW50byB0aGUgc3RyZWFtXHJcblxyXG4vLyAvLyBzdW06IDY2YlxyXG4vLyA8bW91c2UtYnV0dG9uPiA6Oj0gMGIwMDEwIDx0aW1lLWRpZmZlcmVuY2U6MjBiPlxyXG4vLyAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbi1zdGF0ZToxYj4gPGJ1dHRvbi1kZWZpbml0aW9uOjViPiAvLyBidXR0b24tc3RhdGUgPT0gMSBmb3IgXCJkb3duXCIsID09IDAgZm9yIFwidXBcIlxyXG4vLyAgICAgICAgICAgICAgICAgICAgLy8gPG1vdXNlLXNjcmVlbi14OjE4Yj4gPG1vdXNlLXNjcmVlbi15OjE4Yj5cclxuXHJcbi8vIDx0b3VjaC1jaGFuZ2U+IDo6PSAwYjAwMTEgPHRpbWUtZGlmZmVyZW5jZToyMGI+XHJcbi8vICAgICAgICAgICAgICAgICAgICA8dG91Y2gtc3RhdGU6MWI+IDx0b3VjaC1pZDo1Yj4gLy8gdG91Y2gtc3RhdGUgPT0gMSBmb3IgXCJkb3duXCIvXCJzdGFydFwiLCA9PSAwIGZvciBcInVwXCIvXCJlbmRcIlxyXG4vLyAgICAgICAgICAgICAgICAgICAgPHRvdWNoLXNjcmVlbi14OjE4Yj4gPHRvdWNoLXNjcmVlbi15OjE4Yj5cclxuXHJcbi8vIC8vIHN1bTogNDhiXHJcbi8vIDxzY3JvbGwtY2hhbmdlPiA6Oj0gMGIwMTAwIDx0aW1lLWRpZmZlcmVuY2U6MjBiPlxyXG4vLyAgICAgICAgICAgICAgICAgICAgIDxzaWduLW9mLWR4OjFiPiA8YWJzLWR4OjExYj5cclxuLy8gICAgICAgICAgICAgICAgICAgICA8c2lnbi1vZi1keToxYj4gPGFicy1keToxMWI+XHJcblxyXG4vLyAvLyBzdW06IDM2YlxyXG4vLyA8bW91c2Utd2hlZWwteD4gOjo9IDBiMDExMCA8dGltZS1kaWZmZXJlbmNlOjIwYj5cclxuLy8gICAgICAgICAgICAgICAgICAgICA8c2lnbi1vZi1kOjFiPiA8YWJzLWQ6MTFiPlxyXG5cclxuLy8gLy8gc3VtOiAzNmJcclxuLy8gPG1vdXNlLXdoZWVsLXk+IDo6PSAwYjAxMTEgPHRpbWUtZGlmZmVyZW5jZToyMGI+XHJcbi8vICAgICAgICAgICAgICAgICAgICAgPHNpZ24tb2YtZDoxYj4gPGFicy1kOjExYj5cclxuXHJcbi8vIC8vIHN1bTogNTRiXHJcbi8vIDx3aW5kb3ctc2l6ZS1jaGFuZ2U+IDo6PSAwYjEwMDAgPHRpbWUtZGlmZmVyZW5jZToyMGI+XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICA8aW5uZXItd2luZG93LXdpZHRoOjE1Yj4gPGlubmVyLXdpbmRvdy1oZWlnaHQ6MTViPlxyXG5cclxuLy8gLy8gc3VtOiA1NGJcclxuLy8gPHdpbmRvdy1wb3NpdGlvbi1jaGFuZ2U+IDo6PSAwYjEwMDEgPHRpbWUtZGlmZmVyZW5jZToyMGI+XHJcbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8d2luZG93LXBvc2l0aW9uLWxlZnQ6MTViPiA8d2luZG93LXBvc2l0aW9uLXRvcDoxNWI+XHJcblxyXG4vLyAvLyBzdW06IDI0YlxyXG4vLyA8dmlzaWJpbGl0eS1jaGFuZ2U+IDo6PSAwYjEwMTAgPHRpbWUtZGlmZmVyZW5jZToyMGI+IC8vICh2aXNpYmxlL2ZvY3VzZWQpXHJcbi8vIDx2aXNpYmlsaXR5LWNoYW5nZT4gOjo9IDBiMTAxMSA8dGltZS1kaWZmZXJlbmNlOjIwYj4gLy8gKGhpZGRlbi9pZGxlKVxyXG5cclxuLy8gLy8gc3VtOiAyNGJcclxuLy8gPHVubG9hZD4gOjo9IDBiMTEwMCA8dGltZS1kaWZmZXJlbmNlOjIwYj5cclxuXHJcbi8vIC8vIHN1bTogdmFyaWFibGVcclxuLy8gPG1hcmtlcj4gOjo9IDBiMTExMCA8dGltZS1kaWZmZXJlbmNlOjIwYj5cclxuLy8gICAgICAgICAgICAgIDxzaXplOjEyYj4gPHVybC1lbmNvZGVkLXN0cmluZzo8c2l6ZSBpbiBieXRlcz4+XHJcblxyXG4vLyAvLyBzdW06IDQrMjArNDIrKDEyKjE4KSA9IDI4MmJcclxuLy8gPHN0YXRlPiA6Oj0gMGIxMTExIDx0aW1lLWRpZmZlcmVuY2U6MjBiPlxyXG4vLyAgICAgICAgICAgICA8Y3VycmVudC10aW1lLXN0YW1wOjQyYj5cclxuLy8gICAgICAgICAgICAgPG1vdXNlLXNjcmVlbi14OjE4Yj4gPG1vdXNlLXNjcmVlbi15OjE4Yj5cclxuLy8gICAgICAgICAgICAgLy8gPG1vdXNlLWNsaWVudC14OjE4Yj4gPG1vdXNlLWNsaWVudC15OjE4Yj4gLy8gdGVtcG9yYXJpbHkgZGlzYWJsZWRcclxuLy8gICAgICAgICAgICAgPHBhZ2Utc2Nyb2xsLXgobGVmdCk6MThiPiA8cGFnZS1zY3JvbGwtdG9wLXkodG9wKToxOGI+XHJcbi8vICAgICAgICAgICAgIDxpbm5lci13aW5kb3ctd2lkdGg6MThiPiA8aW5uZXItd2luZG93LWhlaWdodDoxOGI+XHJcbi8vICAgICAgICAgICAgIDxvdXRlci13aW5kb3ctd2lkdGg6MThiPiA8b3V0ZXItd2luZG93LWhlaWdodDoxOGI+XHJcbi8vICAgICAgICAgICAgIDx3aW5kb3ctcG9zaXRpb24tbGVmdDoxOGI+IDx3aW5kb3ctcG9zaXRpb24tdG9wOjE4Yj5cclxuLy8gICAgICAgICAgICAgPHNjcmVlbi13aWR0aDoxOGI+IDxzY3JlZW4taGVpZ2h0OjE4Yj5cclxuXHJcbi8vIEpzRG9jIGtleXdvcmQ6XHJcbi8vIGh0dHBzOi8vY29kZS5nb29nbGUuY29tL3AvanNkb2MtdG9vbGtpdC93aWtpL1RhZ1JlZmVyZW5jZVxyXG5cclxuLy8gQGxpbmsgQ2xhc3NOYW1lI0NJVHJhcFxyXG5cclxuaW1wb3J0IFN0YXRlIGZyb20gJy4vc3RhdGUuanMnO1xyXG5pbXBvcnQgU3RhdGVIYW5kbGVyIGZyb20gJy4vc3RhdGVoYW5kbGVyLmpzJztcclxuaW1wb3J0IFRvdWNoSGFuZGxlciBmcm9tICcuL3RvdWNoSGFuZGxlci5qcyc7XHJcbmltcG9ydCBNYXJrZXJIYW5kbGVyIGZyb20gJy4vbWFya2VySGFuZGxlci5qcyc7XHJcbmltcG9ydCBNb3VzZU1vdmVIYW5kbGVyIGZyb20gJy4vbW91c2VNb3ZlSGFuZGxlci5qcyc7XHJcbmltcG9ydCBNb3VzZUJ1dHRvbkhhbmRsZXIgZnJvbSAnLi9tb3VzZUJ1dHRvbkhhbmRsZXIuanMnO1xyXG5pbXBvcnQgUGFnZVNjcm9sbEhhbmRsZXIgZnJvbSAnLi9wYWdlU2Nyb2xsSGFuZGxlci5qcyc7XHJcbmltcG9ydCBXaW5kb3dTaXplSGFuZGxlciBmcm9tICcuL3dpbmRvd1NpemVIYW5kbGVyLmpzJztcclxuaW1wb3J0IFdpbmRvd1Bvc2l0aW9uSGFuZGxlciBmcm9tICcuL3dpbmRvd1Bvc2l0aW9uSGFuZGxlci5qcyc7XHJcbmltcG9ydCBXaW5kb3dVbmxvYWRIYW5kbGVyIGZyb20gJy4vd2luZG93VW5sb2FkSGFuZGxlci5qcyc7XHJcbmltcG9ydCBWaXNpYmlsaXR5Q2hhbmdlSGFuZGxlciBmcm9tICcuL3Zpc2liaWxpdHlDaGFuZ2VIYW5kbGVyLmpzJztcclxuLy8gIGltcG9ydCAgTW91c2VXaGVlbEhhbmRsZXIgPSBmcm9tICcuL21vdXNlV2hlZWxIYW5kbGVyLmpzJ1xyXG5cclxuaW1wb3J0IFRyYW5zcG9ydCBmcm9tICcuL3RyYW5zcG9ydC5qcyc7XHJcbmltcG9ydCBpc051bGxPclVuZGVmaW5lZCBmcm9tICd1dGlsJztcclxuaW1wb3J0IEtleVN0cm9rZUhhbmRsZXIgZnJvbSAnLi9rZXlTdHJva2VIYW5kbGVyLmpzJztcclxuXHJcbmNsYXNzIENJVHJhcCB7XHJcbiAgY29uc3RydWN0b3IgKGVsZW1lbnQgPSB3aW5kb3cuZG9jdW1lbnQsIGlkbGVUaW1lb3V0ID0gMCkge1xyXG4gICAgdmFyIHdpbmRvd0FsaWFzID0gd2luZG93O1xyXG4gICAgdmFyIGRvY3VtZW50QWxpYXMgPSB3aW5kb3cuZG9jdW1lbnQ7XHJcbiAgICB2YXIgdW5kZWZpbmVkQWxpYXM7XHJcblxyXG4gICAgdmFyIHdpbmRvd1N1cHBvcnQgPSAoZWxlbWVudCA9PT0gd2luZG93QWxpYXMgfHwgZWxlbWVudCA9PT0gZG9jdW1lbnRBbGlhcyk7XHJcbiAgICB2YXIgdG91Y2hTdXBwb3J0ID0gJ29udG91Y2hzdGFydCcgaW4gd2luZG93QWxpYXMgfHwgJ29ubXNnZXN0dXJlY2hhbmdlJyBpbiB3aW5kb3dBbGlhczsgLy8gd29ya3Mgb24gaWUxMFxyXG5cclxuICAgIC8vIFNldCB1cCBkZWZhdWx0cy5cclxuICAgIGlmIChlbGVtZW50ID09PSB1bmRlZmluZWRBbGlhcykge1xyXG4gICAgICB0aGlzLmVsZW1lbnQgPSBkb2N1bWVudEFsaWFzO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcclxuICAgIH1cclxuICAgIC8vIG1hc3RlciBsb29wXHJcbiAgICB0aGlzLnJ1bm5pbmcgPSBmYWxzZTtcclxuXHJcbiAgICAvLyBCdWZmZXIgKyB0cmFuc3BvcnRcclxuICAgIHRoaXMudHJhbnNwb3J0ID0gbmV3IFRyYW5zcG9ydCh3aW5kb3dBbGlhcyk7XHJcblxyXG4gICAgLy8gU3RhdGVcclxuICAgIHRoaXMuc3RhdGUgPSBuZXcgU3RhdGUod2luZG93QWxpYXMsIHRoaXMudHJhbnNwb3J0LCBpZGxlVGltZW91dCk7XHJcblxyXG4gICAgLy8gSGFuZGxlcnNcclxuICAgIHRoaXMuaGFuZGxlcnMgPSBuZXcgQXJyYXkodGhpcy5zdGF0ZSk7XHJcblxyXG4gICAgdGhpcy5tYXJrZXJIYW5kbGVyID0gbmV3IE1hcmtlckhhbmRsZXIod2luZG93QWxpYXMsIGRvY3VtZW50QWxpYXMsIGVsZW1lbnQsIHRoaXMuc3RhdGUsIHRoaXMudHJhbnNwb3J0KTtcclxuXHJcbiAgICB0aGlzLmhhbmRsZXJzLnB1c2gobmV3IFN0YXRlSGFuZGxlcih3aW5kb3dBbGlhcywgZG9jdW1lbnRBbGlhcywgZWxlbWVudCwgdGhpcy5zdGF0ZSwgdGhpcy50cmFuc3BvcnQpKTtcclxuICAgIHRoaXMuaGFuZGxlcnMucHVzaCh0aGlzLm1hcmtlckhhbmRsZXIpO1xyXG4gICAgdGhpcy5oYW5kbGVycy5wdXNoKG5ldyBNb3VzZU1vdmVIYW5kbGVyKGVsZW1lbnQsIHRoaXMuc3RhdGUsIHRoaXMudHJhbnNwb3J0KSk7XHJcbiAgICB0aGlzLmhhbmRsZXJzLnB1c2gobmV3IE1vdXNlQnV0dG9uSGFuZGxlcihlbGVtZW50LCB0aGlzLnN0YXRlLCB0aGlzLnRyYW5zcG9ydCkpO1xyXG4gICAgdGhpcy5oYW5kbGVycy5wdXNoKG5ldyBLZXlTdHJva2VIYW5kbGVyKGVsZW1lbnQsIHRoaXMuc3RhdGUsIHRoaXMudHJhbnNwb3J0KSk7XHJcblxyXG4gICAgLy8gSUUgNiwgNywgOCBkb2VzIG5vdCBzdXBwb3J0IHNjcm9sbCBldmVudCBvbiBkb2N1bWVudFxyXG4gICAgLy8gaHR0cDovL3d3dy5xdWlya3Ntb2RlLm9yZy9kb20vZXZlbnRzL3Njcm9sbC5odG1sXHJcbiAgICB0aGlzLmhhbmRsZXJzLnB1c2gobmV3IFBhZ2VTY3JvbGxIYW5kbGVyKGVsZW1lbnQgPT09IGRvY3VtZW50QWxpYXMgPyB3aW5kb3dBbGlhcyA6IGVsZW1lbnQsIHRoaXMuc3RhdGUsIHRoaXMudHJhbnNwb3J0KSk7XHJcblxyXG4gICAgLy8gaGFuZGxlcnMucHVzaChuZXcgTW91c2VXaGVlbEhhbmRsZXIuZGVmYXVsdC5wcm90b3R5cGUuY29uc3RydWN0b3IoZWxlbWVudCwgc3RhdGUsIHRyYW5zcG9ydCkpO1xyXG5cclxuICAgIGlmICh3aW5kb3dTdXBwb3J0KSB7XHJcbiAgICAgIHRoaXMuaGFuZGxlcnMucHVzaChuZXcgV2luZG93U2l6ZUhhbmRsZXIod2luZG93QWxpYXMsIHRoaXMuc3RhdGUsIHRoaXMudHJhbnNwb3J0KSk7XHJcbiAgICAgIHRoaXMuaGFuZGxlcnMucHVzaChuZXcgV2luZG93UG9zaXRpb25IYW5kbGVyKHdpbmRvd0FsaWFzLCBkb2N1bWVudEFsaWFzLCB0aGlzLnN0YXRlLCB0aGlzLnRyYW5zcG9ydCkpO1xyXG4gICAgICB0aGlzLmhhbmRsZXJzLnB1c2gobmV3IFdpbmRvd1VubG9hZEhhbmRsZXIod2luZG93QWxpYXMsIHRoaXMuc3RhdGUsIHRoaXMudHJhbnNwb3J0KSk7XHJcbiAgICAgIHRoaXMuaGFuZGxlcnMucHVzaChuZXcgVmlzaWJpbGl0eUNoYW5nZUhhbmRsZXIod2luZG93QWxpYXMsIHRoaXMuc3RhdGUsIHRoaXMudHJhbnNwb3J0KSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRvdWNoU3VwcG9ydCkge1xyXG4gICAgICB0aGlzLmhhbmRsZXJzLnB1c2gobmV3IFRvdWNoSGFuZGxlcihlbGVtZW50LCB0aGlzLnN0YXRlLCB0aGlzLnRyYW5zcG9ydCkpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuc3RhcnQgPSB0aGlzLnN0YXJ0LmJpbmQodGhpcyk7XHJcbiAgICB0aGlzLnN0b3AgPSB0aGlzLnN0b3AuYmluZCh0aGlzKTtcclxuICB9XHJcbiAgLypcclxuICAgKiBQdWJsaWMgbWV0aG9kc1xyXG4gICAqL1xyXG5cclxuICAvKipcclxuICAgKiAgU3RhcnRzIGV2ZW50IHByb2Nlc3NpbmcuXHJcbiAgICovXHJcbiAgc3RhcnQgKG9wdGlvbnMpIHtcclxuICAgIGlmICh0aGlzLnJ1bm5pbmcpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XHJcbiAgICB2YXIgbGVuZ3RoID0gdGhpcy5oYW5kbGVycy5sZW5ndGg7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIGlmICgodGhpcy5oYW5kbGVyc1tpXSAhPT0gaXNOdWxsT3JVbmRlZmluZWQpICYmICh0eXBlb2YgdGhpcy5oYW5kbGVyc1tpXS5zdGFydCA9PT0gJ2Z1bmN0aW9uJykpIHtcclxuICAgICAgICB0aGlzLmhhbmRsZXJzW2ldLnN0YXJ0KG9wdGlvbnMpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICB0aGlzLnJ1bm5pbmcgPSB0cnVlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogIFN0b3BzIGV2ZW50IHByb2Nlc3NpbmcuXHJcbiAgICovXHJcbiAgc3RvcCAoKSB7XHJcbiAgICBpZiAoIXRoaXMucnVubmluZykge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICB2YXIgbGVuZ3RoID0gdGhpcy5oYW5kbGVycy5sZW5ndGg7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIGlmICgodGhpcy5oYW5kbGVyc1tpXSAhPT0gaXNOdWxsT3JVbmRlZmluZWQpICYmICh0eXBlb2YgdGhpcy5oYW5kbGVyc1tpXS5zdG9wID09PSAnZnVuY3Rpb24nKSkge1xyXG4gICAgICAgIHRoaXMuaGFuZGxlcnNbaV0uc3RvcCgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICB0aGlzLnJ1bm5pbmcgPSBmYWxzZTtcclxuICB9XHJcblxyXG4gIGJ1ZmZlciAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy50cmFuc3BvcnQuZ2V0QnVmZmVyKCk7XHJcbiAgfVxyXG5cclxuICBzZW5kICgpIHtcclxuICAgIHJldHVybiB0aGlzLnRyYW5zcG9ydC5zZW5kLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcbiAgfVxyXG5cclxuICBzZXRIZWFkZXIgKCkge1xyXG4gICAgcmV0dXJuIHRoaXMudHJhbnNwb3J0LnNldEhlYWRlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG4gIH1cclxuXHJcbiAgc2V0VXJsICgpIHtcclxuICAgIHJldHVybiB0aGlzLnRyYW5zcG9ydC5zZXRVcmwuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuICB9XHJcblxyXG4gIHNldFNlc3Npb25JRCAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy50cmFuc3BvcnQuc2V0U2Vzc2lvbklELmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcbiAgfVxyXG5cclxuICBtYXJrICh0ZXh0KSB7XHJcbiAgICBpZiAodGhpcy5tYXJrZXJIYW5kbGVyKSB7XHJcbiAgICAgIHRoaXMubWFya2VySGFuZGxlci50cmlnZ2VyKHRleHQpO1xyXG4gICAgfVxyXG4gIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBFeHBvc2UgQ0lUcmFwXHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBDSVRyYXA7XHJcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9pbmRleC5qcyIsIlxyXG52YXJcclxuICBpZGxlVGltZXIsXHJcbiAgZXBvY2hUcywgbGFzdFRzO1xyXG5cclxuY2xhc3MgU3RhdGUge1xyXG4gIGNvbnN0cnVjdG9yICh3aW5kb3csIHRyYW5zcG9ydCwgaWRsZVRpbWVvdXQpIHtcclxuICAgIHRoaXMud2luZG93ID0gd2luZG93O1xyXG4gICAgdGhpcy50cmFuc3BvcnQgPSB0cmFuc3BvcnQ7XHJcbiAgICB0aGlzLmlkbGVUaW1lb3V0ID0gaWRsZVRpbWVvdXQ7XHJcblxyXG4gICAgdGhpcy5nZXREVCA9IHRoaXMuZ2V0RFQuYmluZCh0aGlzKTtcclxuICAgIHRoaXMuaWRsZUhhbmRsZXIgPSB0aGlzLmlkbGVIYW5kbGVyLmJpbmQodGhpcyk7XHJcblxyXG4gICAgaWYgKGlkbGVUaW1lb3V0ICE9PSAwKSB7XHJcbiAgICAgIHRoaXMuaWRsZUhhbmRsZXIoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGlkbGVIYW5kbGVyICgpIHtcclxuICAgIHRoaXMudHJhbnNwb3J0LnNlbmQoKTtcclxuICAgIGlkbGVUaW1lciA9IG51bGw7XHJcbiAgfVxyXG5cclxuICAvKlxyXG4gICAqIFJldHVybnMgYSBzdGFibGUgdGltZSBkaWZmZXJlbmNlIChiZXR3ZWVuIGV2ZW50cywgZXZlbiBpZiBldmVudCBkb2VzIG5vdFxyXG4gICAqIHN1cHBvcnQgZXZlbnQudGltZVN0YW1wKS5cclxuICAgKlxyXG4gICAqIEV4YW1wbGVzOlxyXG4gICAqICAgICAgICAgICAgICAgICAgMCAtLSBmaXJlZm94IHdpbmRvdyByZXNpemUgLyBzY3JvbGxcclxuICAgKiAgICAgICAgICAxNjEyNjI0MDAgLS0gZmlyZWZveCBtb3VzZSBtb3ZlXHJcbiAgICogICAgICAgICAxNDA5MDk2MTM2IC0tIHRpbWVzdGFtcCBzZWNcclxuICAgKiAgICAgICAgIDIwMDAwMDAwMDAgLS0gdGltZXN0YW1wIHNlYyBib3VuZGFyeVxyXG4gICAqICAgICAgMTQwOTA5NTc3MDcxMyAtLSBjaHJvbWUgYWxsXHJcbiAgICogICAgICAxNDA5MDk2ODM4NzE3IC0tIGZpcmVmb3ggKG5ldyBEYXRlKCkpLmdldFRpbWUoKVxyXG4gICAqICAgMTAwMDAwMDAwMDAwMDAwMCAtLSB0aW1lc3RhbXAgbWljcm8gYm91bmRhcnlcclxuICAgKiAgIDE0MDkwOTY0MjQzNjQxNDkgLS0gZmlyZWZveCBjdXN0b20gZXZlbnRcclxuICAgKi9cclxuICBnZXREVCAoZXZlbnQsIGJpdHMpIHtcclxuICAgIHZhciByb3VuZCA9IE1hdGgucm91bmQ7XHJcbiAgICB2YXIgY3VycmVudFRzID0gKGV2ZW50ICYmIHR5cGVvZiBldmVudC50aW1lU3RhbXAgPT09ICdudW1iZXInICYmIGV2ZW50LnRpbWVTdGFtcCkgfHwgKG5ldyBEYXRlKCkpLmdldFRpbWUoKTtcclxuICAgIHZhciBkVDtcclxuXHJcbiAgICBpZiAoaWRsZVRpbWVyKSB7XHJcbiAgICAgIHRoaXMud2luZG93LmNsZWFyVGltZW91dChpZGxlVGltZXIpO1xyXG4gICAgICBpZGxlVGltZXIgPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChjdXJyZW50VHMgPiAxMDAwMDAwMDAwMDAwMDAwKSB7IC8vIChtaWNyb3NlY29uZHMpIGluIEZpcmVmb3gsIHNwZWNpYWwgZXZlbnRzXHJcbiAgICAgIGN1cnJlbnRUcyA9IHJvdW5kKGN1cnJlbnRUcyAvIDEwMDApO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChjdXJyZW50VHMgPCAyMDAwMDAwMDAwKSB7IC8vIChtaWxsaXNlY29uZHMpIGl0J3MgRmlyZWZveDsgdGFrZSBjYXJlXHJcbiAgICAgIGlmICghZXBvY2hUcykge1xyXG4gICAgICAgIGVwb2NoVHMgPSAobmV3IERhdGUoKSkuZ2V0VGltZSgpIC0gY3VycmVudFRzO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChsYXN0VHMpIHtcclxuICAgICAgICBkVCA9IChjdXJyZW50VHMgKyBlcG9jaFRzKSAtIGxhc3RUcztcclxuICAgICAgfVxyXG4gICAgICBsYXN0VHMgPSAoY3VycmVudFRzICsgZXBvY2hUcyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyAobWlsbGlzZWNvbmRzKSBldmVyeXRoaW5nIGVsc2VcclxuICAgICAgaWYgKGxhc3RUcykge1xyXG4gICAgICAgIGRUID0gY3VycmVudFRzIC0gbGFzdFRzO1xyXG4gICAgICB9XHJcbiAgICAgIGxhc3RUcyA9IGN1cnJlbnRUcztcclxuICAgIH1cclxuXHJcbiAgICAvLyB2YXIgZFQxID0gZFQ7XHJcblxyXG4gICAgaWYgKGRUID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgcmV0dXJuIDA7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMuaWRsZVRpbWVvdXQgIT09IDApIHtcclxuICAgICAgaWRsZVRpbWVyID0gdGhpcy53aW5kb3cuc2V0VGltZW91dCh0aGlzLmlkbGVIYW5kbGVyLCB0aGlzLmlkbGVUaW1lb3V0KTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoYml0cykge1xyXG4gICAgICB2YXIgbWF4ID0gKDEgPDwgYml0cykgLSAxO1xyXG4gICAgICBkVCA9IGRUID4gbWF4ID8gbWF4IDogZFQ7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVE9ETyB3ZSBzaG91bGQgY29ycmVjdCBzeW5jICh3aGVuIGRUIDwgMClcclxuICAgIC8vIGlmIChkVCA8IDApIHsgLy8gd2UgY2FuIGNvcnJlY3Qgc3luY1xyXG4gICAgLy8gICBlcG9jaFRzID0gZXBvY2hUcyArIGRUO1xyXG4gICAgLy8gICBsYXN0VHMgID0gbGFzdFRzICsgZFQ7XHJcbiAgICAvLyAgIGRUID0gMDtcclxuICAgIC8vIH1cclxuICAgIC8vIGNvbnNvbGUubG9nKGRUMSwgZFQsIGRUMSAhPT0gZFQgJiYgXCItLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVwiKTtcclxuXHJcbiAgICByZXR1cm4gZFQ7XHJcbiAgfTtcclxuXHJcbiAgbGFzdFRzICgpIHtcclxuICAgIHJldHVybiBsYXN0VHM7XHJcbiAgfTtcclxuXHJcbiAgc3RhcnQgKCkge1xyXG4gICAgLy8gbm9vcFxyXG4gIH07XHJcblxyXG4gIHN0b3AgKCkge1xyXG4gICAgbGFzdFRzID0gbnVsbDtcclxuICB9O1xyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgU3RhdGU7XHJcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9zdGF0ZS5qcyIsInZhciBldmVudE5hbWUgPSAnY3Q6c3RhdGUnO1xyXG5cclxuY2xhc3MgU3RhdGVIYW5kbGVyIHtcclxuICBjb25zdHJ1Y3RvciAod2luZG93LCBkb2N1bWVudCwgZWxlbWVudCwgc3RhdGUsIGJ1ZmZlcikge1xyXG4gICAgdGhpcy53aW5kb3cgPSB3aW5kb3c7XHJcbiAgICB0aGlzLmRvY3VtZW50ID0gZG9jdW1lbnQ7XHJcbiAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xyXG4gICAgdGhpcy5zdGF0ZSA9IHN0YXRlO1xyXG4gICAgdGhpcy5idWZmZXIgPSBidWZmZXI7XHJcblxyXG4gICAgdGhpcy5oYW5kbGVyID0gdGhpcy5oYW5kbGVyLmJpbmQodGhpcyk7XHJcbiAgfVxyXG4gIC8qXHJcbiAgICogU3RhdGUgZXZlbnQgaGFuZGxlci5cclxuICAgKi9cclxuICBoYW5kbGVyIChldmVudCkge1xyXG4gICAgdmFyXHJcbiAgICAgIGRUID0gdGhpcy5zdGF0ZS5nZXREVChldmVudCwgMjApO1xyXG5cclxuICAgIHRoaXMuYnVmZmVyLnB1c2goWzE1LCBkVCwgdGhpcy5zdGF0ZS5sYXN0VHMoKSwgLy8gMGIxMTExIDx0aW1lLWRpZmZlcmVuY2U6MjBiPiA8Y3VycmVudC10aW1lLXN0YW1wOjQyYj5cclxuICAgICAgdGhpcy5zdGF0ZS5tb3VzZVNjcmVlblgsIHRoaXMuc3RhdGUubW91c2VTY3JlZW5ZLCAvLyA8bW91c2Utc2NyZWVuLXg6MThiPiA8bW91c2Utc2NyZWVuLXk6MThiPlxyXG4gICAgICAvLyBzdGF0ZS5jWCwgc3RhdGUuY1ksIC8vIDxtb3VzZS1jbGllbnQteDoxOGI+IDxtb3VzZS1jbGllbnQteToxOGI+XHJcbiAgICAgIHRoaXMuc3RhdGUucGFnZVNjcm9sbFgsIHRoaXMuc3RhdGUucGFnZVNjcm9sbFksIC8vIDxwYWdlLXNjcm9sbC14KGxlZnQpOjE4Yj4gPHBhZ2Utc2Nyb2xsLXkodG9wKToxOGI+XHJcbiAgICAgIHRoaXMud2luZG93LmlubmVyV2lkdGgsIHRoaXMud2luZG93LmlubmVySGVpZ2h0LCAvLyA8aW5uZXItd2luZG93LXdpZHRoOjE4Yj4gPGlubmVyLXdpbmRvdy1oZWlnaHQ6MThiPlxyXG4gICAgICB0aGlzLndpbmRvdy5vdXRlcldpZHRoLCB0aGlzLndpbmRvdy5vdXRlckhlaWdodCwgLy8gPG91dGVyLXdpbmRvdy13aWR0aDoxOGI+IDxvdXRlci13aW5kb3ctaGVpZ2h0OjE4Yj5cclxuICAgICAgdGhpcy53aW5kb3cuc2NyZWVuWCB8fCB0aGlzLndpbmRvdy5zY3JlZW5MZWZ0LCAvLyA8d2luZG93LXBvc2l0aW9uLWxlZnQ6MThiPlxyXG4gICAgICB0aGlzLndpbmRvdy5zY3JlZW5ZIHx8IHRoaXMud2luZG93LnNjcmVlblRvcCwgLy8gPHdpbmRvdy1wb3NpdGlvbi10b3A6MThiPlxyXG4gICAgICB0aGlzLndpbmRvdy5zY3JlZW4ud2lkdGgsIHRoaXMud2luZG93LnNjcmVlbi5oZWlnaHQgLy8gPHNjcmVlbi13aWR0aDoxOGI+IDxzY3JlZW4taGVpZ2h0OjE4Yj5cclxuICAgIF0sXHJcbiAgICBbNCwgMjAsIDQyLFxyXG4gICAgICAxOCwgMTgsIC8vIDE4LCAxOCxcclxuICAgICAgMTgsIDE4LCAxOCwgMTgsXHJcbiAgICAgIDE4LCAxOCwgMTgsIDE4LFxyXG4gICAgICAxOCwgMThdKTtcclxuICB9O1xyXG5cclxuICB0cmlnZ2VyICgpIHtcclxuICAgIHZhciBzdGF0ZUV2ZW50ID0gdGhpcy5kb2N1bWVudC5jcmVhdGVFdmVudCgnQ3VzdG9tRXZlbnQnKTtcclxuICAgIHN0YXRlRXZlbnQuaW5pdEV2ZW50KGV2ZW50TmFtZSwgdHJ1ZSwgZmFsc2UpO1xyXG4gICAgdGhpcy5lbGVtZW50LmRpc3BhdGNoRXZlbnQoc3RhdGVFdmVudCk7XHJcbiAgfTtcclxuXHJcbiAgc3RhcnQgKG9wdGlvbnMpIHtcclxuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgdGhpcy5oYW5kbGVyLCBmYWxzZSk7XHJcbiAgICBpZiAob3B0aW9ucy5pbml0aWFsU3RhdGUgPT09IHRydWUpIHtcclxuICAgICAgdGhpcy50cmlnZ2VyKCk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgc3RvcCAoKSB7XHJcbiAgICB0aGlzLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIHRoaXMuaGFuZGxlcik7XHJcbiAgfTtcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFN0YXRlSGFuZGxlcjtcclxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3N0YXRlaGFuZGxlci5qcyIsIi8vIFRPRE86IHNhdmUgdG91Y2hTY3JlZW5YL1kgdmFsdWVzIGludG8gc3RhdGVcclxuLy8gVE9ETzogc2ltcGxpZnkgLyBncm91cCBzdGFydC9lbmQvbW92ZSBoYW5kbGVycywgdGhleSBhcmUgbmVhcmx5IGlkZW50aWNhbFxyXG52YXIgc3RhcnRFdmVudE5hbWUgPSAndG91Y2hzdGFydCc7XHJcbnZhciBlbmRFdmVudE5hbWUgPSAndG91Y2hlbmQnO1xyXG52YXIgbW92ZUV2ZW50TmFtZSA9ICd0b3VjaG1vdmUnO1xyXG5cclxudmFyIHRvdWNoSWRUb0lkID0gW107XHJcblxyXG5jbGFzcyBUb3VjaEhhbmRsZXIge1xyXG4gIGNvbnN0cnVjdG9yIChlbGVtZW50LCBzdGF0ZSwgYnVmZmVyKSB7XHJcbiAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xyXG4gICAgdGhpcy5zdGF0ZSA9IHN0YXRlO1xyXG4gICAgdGhpcy5idWZmZXIgPSBidWZmZXI7XHJcblxyXG4gICAgdGhpcy5zdGFydEhhbmRsZXIgPSB0aGlzLnN0YXJ0SGFuZGxlci5iaW5kKHRoaXMpO1xyXG4gICAgdGhpcy5tb3ZlSGFuZGxlciA9IHRoaXMubW92ZUhhbmRsZXIuYmluZCh0aGlzKTtcclxuICAgIHRoaXMuZW5kSGFuZGxlciA9IHRoaXMuZW5kSGFuZGxlci5iaW5kKHRoaXMpO1xyXG4gIH1cclxuICAvLyBmaW5kcyBhbiBleGlzdGluZyAob3IgZnJlZSkgaWQgZm9yIGdpdmVuIHRvdWNoSWQsIHN0YXJ0aW5nIGZyb20gMC5cclxuICByZXNvbHZlSWQgKHRvdWNoSWQpIHtcclxuICAgIHZhciBmaXJzdEZyZWU7XHJcbiAgICB2YXIgbGVuZ3RoID0gdG91Y2hJZFRvSWQubGVuZ3RoO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xyXG4gICAgICBpZiAodG91Y2hJZFRvSWRbaV0gPT09IHRvdWNoSWQpIHsgcmV0dXJuIGk7IH1cclxuICAgICAgaWYgKHRvdWNoSWRUb0lkW2ldID09PSB1bmRlZmluZWQpIHsgZmlyc3RGcmVlID0gZmlyc3RGcmVlIHx8IGk7IH1cclxuICAgIH1cclxuICAgIGlmICh0eXBlb2YgZmlyc3RGcmVlID09PSAnbnVtYmVyJykge1xyXG4gICAgICB0b3VjaElkVG9JZFtmaXJzdEZyZWVdID0gdG91Y2hJZDtcclxuICAgICAgcmV0dXJuIGZpcnN0RnJlZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRvdWNoSWRUb0lkLnB1c2godG91Y2hJZCk7XHJcbiAgICAgIHJldHVybiBsZW5ndGg7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgLy8gcmVtb3ZlcyB0b3VjaElkIGZyb20gbGlzdC5cclxuICByZW1vdmVJZCAodG91Y2hJZCkge1xyXG4gICAgdmFyIGxlbmd0aCA9IHRvdWNoSWRUb0lkLmxlbmd0aDtcclxuICAgIHZhciBpID0gMDtcclxuICAgIGZvciAoOyBpIDwgbGVuZ3RoOyBpKyspIHtcclxuICAgICAgaWYgKHRvdWNoSWRUb0lkW2ldID09PSB0b3VjaElkKSB7IHRvdWNoSWRUb0lkW2ldID0gdW5kZWZpbmVkOyB9XHJcbiAgICB9XHJcbiAgICBpLS07XHJcbiAgICBmb3IgKDsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgaWYgKHRvdWNoSWRUb0lkW2ldID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICB0b3VjaElkVG9JZC5wb3AoKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHN0YXJ0SGFuZGxlciAoZXZlbnQpIHtcclxuICAgIHZhciBkVCA9IHRoaXMuc3RhdGUuZ2V0RFQoZXZlbnQsIDIwKTtcclxuICAgIHZhciBjaGFuZ2VkVG91Y2hlcyA9IGV2ZW50LmNoYW5nZWRUb3VjaGVzO1xyXG4gICAgdmFyIGxlbmd0aCA9IGNoYW5nZWRUb3VjaGVzLmxlbmd0aDtcclxuXHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIHZhciBldiA9IGNoYW5nZWRUb3VjaGVzW2ldO1xyXG4gICAgICB2YXIgaWQgPSB0aGlzLnJlc29sdmVJZChldi5pZGVudGlmaWVyKTtcclxuICAgICAgdGhpcy5idWZmZXIucHVzaChbMywgZFQsIDEsIGlkLCBldi5zY3JlZW5YLCBldi5zY3JlZW5ZXSxcclxuICAgICAgICBbNCwgMjAsIDEsIDUsIDE4LCAxOF0pO1xyXG4gICAgICBkVCA9IDA7IC8vIG5leHRcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9O1xyXG5cclxuICBlbmRIYW5kbGVyIChldmVudCkge1xyXG4gICAgdmFyIGRUID0gdGhpcy5zdGF0ZS5nZXREVChldmVudCwgMjApO1xyXG4gICAgdmFyIGNoYW5nZWRUb3VjaGVzID0gZXZlbnQuY2hhbmdlZFRvdWNoZXM7XHJcbiAgICB2YXIgbGVuZ3RoID0gY2hhbmdlZFRvdWNoZXMubGVuZ3RoO1xyXG5cclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcclxuICAgICAgdmFyIGV2ID0gY2hhbmdlZFRvdWNoZXNbaV07XHJcbiAgICAgIHZhciBpZCA9IHRoaXMucmVzb2x2ZUlkKGV2LmlkZW50aWZpZXIpO1xyXG4gICAgICB0aGlzLmJ1ZmZlci5wdXNoKFszLCBkVCwgMCwgaWQsIGV2LnNjcmVlblgsIGV2LnNjcmVlblldLFxyXG4gICAgICAgIFs0LCAyMCwgMSwgNSwgMTgsIDE4XSk7XHJcblxyXG4gICAgICB0aGlzLnJlbW92ZUlkKGV2LmlkZW50aWZpZXIpO1xyXG5cclxuICAgICAgZFQgPSAwOyAvLyBuZXh0XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfTtcclxuXHJcbiAgbW92ZUhhbmRsZXIgKGV2ZW50KSB7XHJcbiAgICB2YXIgZFQgPSB0aGlzLnN0YXRlLmdldERUKGV2ZW50LCAyMCk7XHJcbiAgICB2YXIgY2hhbmdlZFRvdWNoZXMgPSBldmVudC5jaGFuZ2VkVG91Y2hlcztcclxuICAgIHZhciBsZW5ndGggPSBjaGFuZ2VkVG91Y2hlcy5sZW5ndGg7XHJcblxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xyXG4gICAgICB2YXIgZXYgPSBjaGFuZ2VkVG91Y2hlc1tpXTtcclxuICAgICAgdmFyIGlkID0gdGhpcy5yZXNvbHZlSWQoZXYuaWRlbnRpZmllcik7XHJcbiAgICAgIHRoaXMuYnVmZmVyLnB1c2goWzEsIGRULCAwLCBpZCwgZXYuc2NyZWVuWCwgZXYuc2NyZWVuWV0sXHJcbiAgICAgICAgWzQsIDIwLCAxLCA1LCAxOCwgMThdKTtcclxuICAgICAgZFQgPSAwOyAvLyBuZXh0XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfTtcclxuXHJcbiAgc3RhcnQgKCkge1xyXG4gICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoc3RhcnRFdmVudE5hbWUsIHRoaXMuc3RhcnRIYW5kbGVyKTtcclxuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKG1vdmVFdmVudE5hbWUsIHRoaXMubW92ZUhhbmRsZXIpO1xyXG4gICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZW5kRXZlbnROYW1lLCB0aGlzLmVuZEhhbmRsZXIpO1xyXG4gIH07XHJcblxyXG4gIHN0b3AgKCkge1xyXG4gICAgdGhpcy5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoc3RhcnRFdmVudE5hbWUsIHRoaXMuc3RhcnRIYW5kbGVyKTtcclxuICAgIHRoaXMuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKG1vdmVFdmVudE5hbWUsIHRoaXMubW92ZUhhbmRsZXIpO1xyXG4gICAgdGhpcy5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoZW5kRXZlbnROYW1lLCB0aGlzLmVuZEhhbmRsZXIpO1xyXG4gIH07XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBUb3VjaEhhbmRsZXI7XHJcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy90b3VjaEhhbmRsZXIuanMiLCJ2YXIgZXZlbnROYW1lID0gJ2N0Om1hcmsnO1xyXG52YXIgZGVmYXVsdFRleHQgPSAnbWFya2VyJztcclxuXHJcbmNsYXNzIE1hcmtlckhhbmRsZXIge1xyXG4gIGNvbnN0cnVjdG9yICh3aW5kb3csIGRvY3VtZW50LCBlbGVtZW50LCBzdGF0ZSwgYnVmZmVyKSB7XHJcbiAgICB0aGlzLndpbmRvdyA9IHdpbmRvdztcclxuICAgIHRoaXMuZG9jdW1lbnQgPSBkb2N1bWVudDtcclxuICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XHJcbiAgICB0aGlzLnN0YXRlID0gc3RhdGU7XHJcbiAgICB0aGlzLmJ1ZmZlciA9IGJ1ZmZlcjtcclxuXHJcbiAgICB0aGlzLmhhbmRsZXIgPSB0aGlzLmhhbmRsZXIuYmluZCh0aGlzKTtcclxuICB9XHJcblxyXG4gIGhhbmRsZXIgKGV2ZW50KSB7XHJcbiAgICB2YXIgZFQgPSB0aGlzLnN0YXRlLmdldERUKGV2ZW50LCAyMCk7XHJcbiAgICB2YXIgdGV4dCA9IChldmVudCAmJiBldmVudC50ZXh0KSB8fCBkZWZhdWx0VGV4dDtcclxuXHJcbiAgICB0aGlzLmJ1ZmZlci5wdXNoKFsxNCwgZFRdLFxyXG4gICAgICBbNCwgMjBdKTtcclxuICAgIHRoaXMuYnVmZmVyLnB1c2hSYXdCeXRlcyh0ZXh0KTtcclxuICB9O1xyXG5cclxuICB0cmlnZ2VyICh0ZXh0KSB7XHJcbiAgICB2YXIgbWFya0V2ZW50ID0gdGhpcy5kb2N1bWVudC5jcmVhdGVFdmVudCgnQ3VzdG9tRXZlbnQnKTtcclxuICAgIG1hcmtFdmVudC5pbml0RXZlbnQoZXZlbnROYW1lLCB0cnVlLCBmYWxzZSk7XHJcbiAgICBtYXJrRXZlbnQudGV4dCA9IHRleHQgfHwgJ21hcmsnO1xyXG4gICAgdGhpcy5lbGVtZW50LmRpc3BhdGNoRXZlbnQobWFya0V2ZW50KTtcclxuICB9O1xyXG5cclxuICBzdGFydCAoKSB7XHJcbiAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIHRoaXMuaGFuZGxlciwgZmFsc2UpO1xyXG4gIH07XHJcblxyXG4gIHN0b3AgKCkge1xyXG4gICAgdGhpcy5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCB0aGlzLmhhbmRsZXIpO1xyXG4gIH07XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IE1hcmtlckhhbmRsZXI7XHJcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9tYXJrZXJIYW5kbGVyLmpzIiwidmFyXHJcbiAgLy8gYWJzID0gTWF0aC5hYnMsXHJcbiAgZXZlbnROYW1lID0gJ21vdXNlbW92ZSc7XHJcblxyXG4vLyBUT0RPOiBodHRwOi8vd3d3LmphY2tsbW9vcmUuY29tL25vdGVzL21vdXNlLXBvc2l0aW9uL1xyXG5cclxuY2xhc3MgTW91c2VNb3ZlSGFuZGxlciB7XHJcbiAgY29uc3RydWN0b3IgKGVsZW1lbnQsIHN0YXRlLCBidWZmZXIpIHtcclxuICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XHJcbiAgICB0aGlzLnN0YXRlID0gc3RhdGU7XHJcbiAgICB0aGlzLmJ1ZmZlciA9IGJ1ZmZlcjtcclxuXHJcbiAgICB0aGlzLmhhbmRsZXIgPSB0aGlzLmhhbmRsZXIuYmluZCh0aGlzKTtcclxuICB9XHJcblxyXG4gIGhhbmRsZXIgKGV2ZW50KSB7XHJcbiAgICB2YXIgZFQgPSB0aGlzLnN0YXRlLmdldERUKGV2ZW50LCAyMCk7XHJcbiAgICB2YXIgc1ggPSBldmVudC5zY3JlZW5YO1xyXG4gICAgdmFyIHNZID0gZXZlbnQuc2NyZWVuWTtcclxuXHJcbiAgICAvLyBTYXZpbmcgZm9yIG5leHQgY2hlY2tcclxuICAgIHRoaXMuc3RhdGUubW91c2VTY3JlZW5YID0gc1g7XHJcbiAgICB0aGlzLnN0YXRlLm1vdXNlU2NyZWVuWSA9IHNZO1xyXG5cclxuICAgIHRoaXMuYnVmZmVyLnB1c2goWzAsIGRULCBzWCwgc1ldLFxyXG4gICAgICBbNCwgMjAsIDE4LCAxOF0pO1xyXG5cclxuICAgIC8vIFNhdmluZyBmb3IgbWFya2VycyAtLSB0ZW1wb3JhcmlseSBkaXNhYmxlZFxyXG4gICAgLy8gc3RhdGUuY1ggPSBldmVudC5jbGllbnRYO1xyXG4gICAgLy8gc3RhdGUuY1kgPSBldmVudC5jbGllbnRZO1xyXG4gICAgLy8gYnVmZmVyLnB1c2goWzAsIGRULCBzWCwgc1ksIGV2ZW50LmNsaWVudFgsIGV2ZW50LmNsaWVudFldLFxyXG4gICAgLy8gICAgICAgICAgICAgWzQsIDIwLCAxOCwgMTgsICAgICAgICAgICAgMTgsICAgICAgICAgICAgMThdKTtcclxuXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9O1xyXG5cclxuICBzdGFydCAoKSB7XHJcbiAgICAvLyBUT0RPOiBTb21ldGhpbmcgbW9yZSBhY2N1cmF0ZSBpcyBuZWVkZWQuXHJcbiAgICB0aGlzLnN0YXRlLm1vdXNlU2NyZWVuWCA9IHRoaXMuc3RhdGUubW91c2VTY3JlZW5YIHx8IDA7XHJcbiAgICB0aGlzLnN0YXRlLm1vdXNlU2NyZWVuWSA9IHRoaXMuc3RhdGUubW91c2VTY3JlZW5ZIHx8IDA7XHJcblxyXG4gICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCB0aGlzLmhhbmRsZXIpO1xyXG4gIH07XHJcblxyXG4gIHN0b3AgKCkge1xyXG4gICAgdGhpcy5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCB0aGlzLmhhbmRsZXIpO1xyXG4gIH07XHJcblxyXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgTW91c2VNb3ZlSGFuZGxlcjtcclxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL21vdXNlTW92ZUhhbmRsZXIuanMiLCJ2YXIgZG93bkV2ZW50TmFtZSA9ICdtb3VzZWRvd24nO1xyXG52YXIgdXBFdmVudE5hbWUgPSAnbW91c2V1cCc7XHJcblxyXG5jbGFzcyBNb3VzZUJ1dHRvbkhhbmRsZXIge1xyXG4gIGNvbnN0cnVjdG9yIChlbGVtZW50LCBzdGF0ZSwgYnVmZmVyKSB7XHJcbiAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xyXG4gICAgdGhpcy5zdGF0ZSA9IHN0YXRlO1xyXG4gICAgdGhpcy5idWZmZXIgPSBidWZmZXI7XHJcblxyXG4gICAgdGhpcy5kb3duSGFuZGxlciA9IHRoaXMuZG93bkhhbmRsZXIuYmluZCh0aGlzKTtcclxuICAgIHRoaXMudXBIYW5kbGVyID0gdGhpcy51cEhhbmRsZXIuYmluZCh0aGlzKTtcclxuICB9XHJcblxyXG4gIGJ1dHRvbiAoZXZlbnQpIHtcclxuICAgIHZhciBiYiA9IGV2ZW50LndoaWNoIHx8IChcclxuICAgICAgZnVuY3Rpb24gKGIpIHtcclxuICAgICAgICBpZiAoYiA9PT0gNCkge1xyXG4gICAgICAgICAgcmV0dXJuIDI7XHJcbiAgICAgICAgfSBlbHNlIGlmIChiID09PSAyKSB7XHJcbiAgICAgICAgICByZXR1cm4gMztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgcmV0dXJuIDE7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KGV2ZW50LmJ1dHRvbikpO1xyXG4gICAgcmV0dXJuIGJiO1xyXG4gIH1cclxuXHJcbiAgZG93bkhhbmRsZXIgKGV2ZW50KSB7XHJcbiAgICB2YXIgZFQgPSB0aGlzLnN0YXRlLmdldERUKGV2ZW50LCAyMCk7XHJcbiAgICB2YXIgc1ggPSBldmVudC5zY3JlZW5YO1xyXG4gICAgdmFyIHNZID0gZXZlbnQuc2NyZWVuWTtcclxuICAgIHRoaXMuYnVmZmVyLnB1c2goWzIsIGRULCBzWCwgc1ksIDAsIHRoaXMuYnV0dG9uKGV2ZW50KV0sIFs0LCAyMCwgMTgsIDE4LCAxLCA1XSk7XHJcbiAgfVxyXG5cclxuICB1cEhhbmRsZXIgKGV2ZW50KSB7XHJcbiAgICB2YXIgZFQgPSB0aGlzLnN0YXRlLmdldERUKGV2ZW50LCAyMCk7XHJcbiAgICB2YXIgc1ggPSBldmVudC5zY3JlZW5YO1xyXG4gICAgdmFyIHNZID0gZXZlbnQuc2NyZWVuWTtcclxuICAgIHRoaXMuYnVmZmVyLnB1c2goWzIsIGRULCBzWCwgc1ksIDAsIHRoaXMuYnV0dG9uKGV2ZW50KV0sIFs0LCAyMCwgMTgsIDE4LCAxLCA1XSk7XHJcbiAgfVxyXG5cclxuICBzdGFydCAoKSB7XHJcbiAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihkb3duRXZlbnROYW1lLCB0aGlzLmRvd25IYW5kbGVyKTtcclxuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKHVwRXZlbnROYW1lLCB0aGlzLnVwSGFuZGxlcik7XHJcbiAgfTtcclxuXHJcbiAgc3RvcCAoKSB7XHJcbiAgICB0aGlzLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihkb3duRXZlbnROYW1lLCB0aGlzLmRvd25IYW5kbGVyKTtcclxuICAgIHRoaXMuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKHVwRXZlbnROYW1lLCB0aGlzLnVwSGFuZGxlcik7XHJcbiAgfTtcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgTW91c2VCdXR0b25IYW5kbGVyO1xyXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvbW91c2VCdXR0b25IYW5kbGVyLmpzIiwidmFyIGFicyA9IE1hdGguYWJzO1xyXG52YXIgZXZlbnROYW1lID0gJ3Njcm9sbCc7XHJcblxyXG4vLyBUT0RPIHNpbXBsaWZ5L2NoZWNrIHRoaXMgaGFuZGxlclxyXG5cclxuY2xhc3MgUGFnZVNjcm9sbEhhbmRsZXIge1xyXG4gIGNvbnN0cnVjdG9yIChlbGVtZW50LCBzdGF0ZSwgYnVmZmVyKSB7XHJcbiAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xyXG4gICAgdGhpcy5zdGF0ZSA9IHN0YXRlO1xyXG4gICAgdGhpcy5idWZmZXIgPSBidWZmZXI7XHJcblxyXG4gICAgdGhpcy5oYW5kbGVyID0gdGhpcy5oYW5kbGVyLmJpbmQodGhpcyk7XHJcbiAgfVxyXG5cclxuICBoYW5kbGVyIChldmVudCkge1xyXG4gICAgdmFyIHBYO1xyXG4gICAgdmFyIHBZO1xyXG4gICAgdmFyIGRYO1xyXG4gICAgdmFyIGRZO1xyXG4gICAgdmFyIHNpZ25EWDtcclxuICAgIHZhciBzaWduRFk7XHJcbiAgICB2YXIgYWJzRFg7XHJcbiAgICB2YXIgYWJzRFk7XHJcblxyXG4gICAgdmFyIGRUID0gdGhpcy5zdGF0ZS5nZXREVChldmVudCwgMjApO1xyXG5cclxuICAgIC8vIFNjcm9sbCBYL1kgb24gY3VycmVudCBwYWdlXHJcbiAgICBpZiAoJ3BhZ2VYT2Zmc2V0JyBpbiB0aGlzLmVsZW1lbnQgJiYgdGhpcy5lbGVtZW50LmRvY3VtZW50KSB7IC8vIGl0J3MgYSB3aW5kb3csIG9yIGxvb2tzIGxpa2UgYSB3aW5kb3dcclxuICAgICAgdmFyIGRvYyA9IHRoaXMuZWxlbWVudC5kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XHJcbiAgICAgIHBYID0gKHRoaXMuZWxlbWVudC5wYWdlWE9mZnNldCB8fCBkb2Muc2Nyb2xsTGVmdCkgLSAoZG9jLmNsaWVudExlZnQgfHwgMCk7XHJcbiAgICAgIHBZID0gKHRoaXMuZWxlbWVudC5wYWdlWU9mZnNldCB8fCBkb2Muc2Nyb2xsVG9wKSAtIChkb2MuY2xpZW50VG9wIHx8IDApO1xyXG4gICAgfSBlbHNlIHsgLy8gZmFsbGJhY2tcclxuICAgICAgcFggPSBldmVudC5wYWdlWDtcclxuICAgICAgcFkgPSBldmVudC5wYWdlWTtcclxuICAgIH1cclxuXHJcbiAgICBkWCA9IHBYIC0gdGhpcy5zdGF0ZS5wWDtcclxuICAgIHNpZ25EWCA9IGRYIDwgMCA/IDEgOiAwO1xyXG4gICAgYWJzRFggPSBhYnMoZFgpO1xyXG4gICAgZFkgPSBwWSAtIHRoaXMuc3RhdGUucFk7XHJcbiAgICBzaWduRFkgPSBkWSA8IDAgPyAxIDogMDtcclxuICAgIGFic0RZID0gYWJzKGRZKTtcclxuXHJcbiAgICB0aGlzLnN0YXRlLnBhZ2VTY3JvbGxYID0gcFg7XHJcbiAgICB0aGlzLnN0YXRlLnBhZ2VTY3JvbGxZID0gcFk7XHJcblxyXG4gICAgdGhpcy5idWZmZXIucHVzaChbNCwgZFQsIHNpZ25EWCwgYWJzRFgsIHNpZ25EWSwgYWJzRFldLFxyXG4gICAgICBbNCwgMjAsIDEsIDExLCAxLCAxMV0pO1xyXG5cclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH07XHJcblxyXG4gIHN0YXJ0ICgpIHtcclxuICAgIC8vIFNjcm9sbCBYL1kgb24gY3VycmVudCBwYWdlXHJcbiAgICBpZiAoJ3BhZ2VYT2Zmc2V0JyBpbiB0aGlzLmVsZW1lbnQgJiYgdGhpcy5lbGVtZW50LmRvY3VtZW50KSB7IC8vIGl0J3MgYSB3aW5kb3csIG9yIGxvb2tzIGxpa2UgYSB3aW5kb3dcclxuICAgICAgdmFyIGRvYyA9IHRoaXMuZWxlbWVudC5kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XHJcbiAgICAgIHRoaXMuc3RhdGUucGFnZVNjcm9sbFggPSAodGhpcy5lbGVtZW50LnBhZ2VYT2Zmc2V0IHx8IGRvYy5zY3JvbGxMZWZ0KSAtIChkb2MuY2xpZW50TGVmdCB8fCAwKTtcclxuICAgICAgdGhpcy5zdGF0ZS5wYWdlU2Nyb2xsWSA9ICh0aGlzLmVsZW1lbnQucGFnZVlPZmZzZXQgfHwgZG9jLnNjcm9sbFRvcCkgLSAoZG9jLmNsaWVudFRvcCB8fCAwKTtcclxuICAgIH0gZWxzZSB7IC8vIGZhbGxiYWNrXHJcbiAgICAgIHRoaXMuc3RhdGUucGFnZVNjcm9sbFggPSAwO1xyXG4gICAgICB0aGlzLnN0YXRlLnBhZ2VTY3JvbGxZID0gMDtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIHRoaXMuaGFuZGxlciwgZmFsc2UpO1xyXG4gIH07XHJcblxyXG4gIHN0b3AgKCkge1xyXG4gICAgdGhpcy5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCB0aGlzLmhhbmRsZXIsIGZhbHNlKTtcclxuICB9O1xyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgUGFnZVNjcm9sbEhhbmRsZXI7XHJcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9wYWdlU2Nyb2xsSGFuZGxlci5qcyIsInZhciBkZWxheSA9IDEwMDAgLyAxNTsgLy8gMTVmcHNcclxudmFyIHRpbWVvdXQ7XHJcblxyXG5jbGFzcyBXaW5kb3dTaXplSGFuZGxlciB7XHJcbiAgY29uc3RydWN0b3IgKHdpbmRvdywgc3RhdGUsIGJ1ZmZlcikge1xyXG4gICAgdGhpcy53aW5kb3cgPSB3aW5kb3c7XHJcbiAgICB0aGlzLnN0YXRlID0gc3RhdGU7XHJcbiAgICB0aGlzLmJ1ZmZlciA9IGJ1ZmZlcjtcclxuXHJcbiAgICB0aGlzLnRocm90dGxlciA9IHRoaXMudGhyb3R0bGVyLmJpbmQodGhpcyk7XHJcbiAgfVxyXG5cclxuICBoYW5kbGVyIChldmVudCkge1xyXG4gICAgdmFyIHcgPSB0aGlzLndpbmRvdy5pbm5lcldpZHRoO1xyXG4gICAgdmFyIGggPSB0aGlzLndpbmRvdy5pbm5lckhlaWdodDtcclxuICAgIHZhciBkVCA9IHRoaXMuc3RhdGUuZ2V0RFQoZXZlbnQsIDIwKTtcclxuXHJcbiAgICAvLyB0eXBlID0gMGIxMDAwXHJcbiAgICB0aGlzLmJ1ZmZlci5wdXNoKFs4LCBkVCwgdywgaF0sXHJcbiAgICAgIFs0LCAyMCwgMTUsIDE1XSk7XHJcbiAgfTtcclxuXHJcbiAgdGhyb3R0bGVyIChldmVudCkge1xyXG4gICAgaWYgKHRpbWVvdXQpIHtcclxuICAgICAgdGhpcy53aW5kb3cuY2xlYXJUaW1lb3V0KHRoaXMudGltZW91dCgpKTtcclxuICAgIH1cclxuXHJcbiAgICB0aW1lb3V0ID0gKCkgPT4ge1xyXG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aW1lb3V0ID0gbnVsbDtcclxuICAgICAgICBzZWxmLmhhbmRsZXIoZXZlbnQpO1xyXG4gICAgICB9LCBkZWxheSk7XHJcbiAgICB9O1xyXG4gIH07XHJcblxyXG4gIHN0YXJ0ICgpIHtcclxuICAgIHRoaXMuc3RhdGUud1cgPSB0aGlzLndpbmRvdy5pbm5lcldpZHRoO1xyXG4gICAgdGhpcy5zdGF0ZS53SCA9IHRoaXMud2luZG93LmlubmVySGVpZ2h0O1xyXG4gICAgdGhpcy53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy50aHJvdHRsZXIsIGZhbHNlKTtcclxuICB9O1xyXG5cclxuICBzdG9wICgpIHtcclxuICAgIHRoaXMud2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMudGhyb3R0bGVyLCBmYWxzZSk7XHJcbiAgfTtcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFdpbmRvd1NpemVIYW5kbGVyO1xyXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvd2luZG93U2l6ZUhhbmRsZXIuanMiLCJ2YXIgZXZlbnROYW1lID0gJ3Bvc2l0aW9uY2hhbmdlZCc7XHJcbnZhciBsb25nRGVsYXkgPSAxMDAwIC8gMjsgLy8gMmZwc1xyXG52YXIgc2hvcnREZWxheSA9IDEwMDAgLyAxNTsgLy8gMTVmcHNcclxudmFyIHRocm90dGxlQmFzZSA9IDE1OyAvLyBpdCdzIGEgXCJjb25zdGFudFwiXHJcbnZhciB0aHJvdHRsZUNvdW50ID0gdGhyb3R0bGVCYXNlO1xyXG52YXIgdGltZW91dDtcclxuXHJcbmNsYXNzIFdpbmRvd1Bvc2l0aW9uSGFuZGxlciB7XHJcbiAgY29uc3RydWN0b3IgKHdpbmRvdywgZG9jdW1lbnQsIHN0YXRlLCBidWZmZXIpIHtcclxuICAgIHRoaXMud2luZG93ID0gd2luZG93O1xyXG4gICAgdGhpcy5kb2N1bWVudCA9IGRvY3VtZW50O1xyXG4gICAgdGhpcy5zdGF0ZSA9IHN0YXRlO1xyXG4gICAgdGhpcy5idWZmZXIgPSBidWZmZXI7XHJcblxyXG4gICAgdGhpcy5oYW5kbGVyID0gdGhpcy5oYW5kbGVyLmJpbmQodGhpcyk7XHJcbiAgICB0aGlzLnBvbGxlciA9IHRoaXMucG9sbGVyLmJpbmQodGhpcyk7XHJcbiAgfVxyXG5cclxuICB3aW5kb3dQb3NpdGlvblggKCkge1xyXG4gICAgcmV0dXJuIHRoaXMud2luZG93LnNjcmVlblggfHwgdGhpcy53aW5kb3cuc2NyZWVuTGVmdCB8fCAwO1xyXG4gIH07XHJcblxyXG4gIHdpbmRvd1Bvc2l0aW9uWSAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy53aW5kb3cuc2NyZWVuWSB8fCB0aGlzLndpbmRvdy5zY3JlZW5Ub3AgfHwgMDtcclxuICB9O1xyXG5cclxuICBoYW5kbGVyIChldmVudCkge1xyXG4gICAgdmFyIGRUID0gdGhpcy5zdGF0ZS5nZXREVChudWxsLCAyMCk7XHJcblxyXG4gICAgdGhpcy5zdGF0ZS53aW5kb3dQb3NpdGlvblggPSBldmVudC54O1xyXG4gICAgdGhpcy5zdGF0ZS53aW5kb3dQb3NpdGlvblkgPSBldmVudC55O1xyXG5cclxuICAgIC8vIHR5cGUgPSAwYjEwMDFcclxuICAgIHRoaXMuYnVmZmVyLnB1c2goWzksIGRULCBldmVudC54LCBldmVudC55XSxcclxuICAgICAgWzQsIDIwLCAxNSwgMTVdKTtcclxuICB9O1xyXG5cclxuICBwb2xsZXIgKCkge1xyXG4gICAgdmFyIHggPSB0aGlzLndpbmRvd1Bvc2l0aW9uWCgpO1xyXG4gICAgdmFyIHkgPSB0aGlzLndpbmRvd1Bvc2l0aW9uWSgpO1xyXG5cclxuICAgIGlmICh0aGlzLnN0YXRlLndpbmRvd1Bvc2l0aW9uWCAhPT0geCB8fCB0aGlzLnN0YXRlLndpbmRvd1Bvc2l0aW9uWSAhPT0geSkge1xyXG4gICAgICB2YXIgZXZlbnQgPSB0aGlzLmRvY3VtZW50LmNyZWF0ZUV2ZW50KCdDdXN0b21FdmVudCcpO1xyXG4gICAgICBldmVudC5pbml0RXZlbnQoZXZlbnROYW1lLCB0cnVlLCBmYWxzZSk7XHJcbiAgICAgIGV2ZW50LnggPSB4O1xyXG4gICAgICBldmVudC55ID0geTtcclxuICAgICAgdGhpcy53aW5kb3cuZGlzcGF0Y2hFdmVudChldmVudCk7XHJcblxyXG4gICAgICB0aHJvdHRsZUNvdW50ID0gdGhyb3R0bGVCYXNlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aHJvdHRsZUNvdW50ID4gMCkge1xyXG4gICAgICB0aHJvdHRsZUNvdW50LS07XHJcbiAgICAgIHRpbWVvdXQgPSB0aGlzLndpbmRvdy5zZXRUaW1lb3V0KHRoaXMucG9sbGVyLCBzaG9ydERlbGF5KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRpbWVvdXQgPSB0aGlzLndpbmRvdy5zZXRUaW1lb3V0KHRoaXMucG9sbGVyLCBsb25nRGVsYXkpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHN0YXJ0UG9sbGVyICgpIHtcclxuICAgIHRoaXMud2luZG93LnNldFRpbWVvdXQodGhpcy5wb2xsZXIsIGxvbmdEZWxheSk7XHJcbiAgfTtcclxuXHJcbiAgc3RvcFBvbGxlciAoKSB7XHJcbiAgICBpZiAodGltZW91dCkge1xyXG4gICAgICB0aGlzLndpbmRvdy5jbGVhclRpbWVvdXQodGltZW91dCk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgc3RhcnQgKCkge1xyXG4gICAgdGhpcy5zdGF0ZS53aW5kb3dQb3NpdGlvblggPSB0aGlzLndpbmRvd1Bvc2l0aW9uWCgpO1xyXG4gICAgdGhpcy5zdGF0ZS53aW5kb3dQb3NpdGlvblkgPSB0aGlzLndpbmRvd1Bvc2l0aW9uWSgpO1xyXG4gICAgdGhpcy53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIHRoaXMuaGFuZGxlciwgZmFsc2UpO1xyXG4gICAgdGhpcy5zdGFydFBvbGxlcigpO1xyXG4gIH07XHJcblxyXG4gIHN0b3AgKCkge1xyXG4gICAgdGhpcy5zdG9wUG9sbGVyKCk7XHJcbiAgICB0aGlzLndpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgdGhpcy5oYW5kbGVyLCBmYWxzZSk7XHJcbiAgfTtcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFdpbmRvd1Bvc2l0aW9uSGFuZGxlcjtcclxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3dpbmRvd1Bvc2l0aW9uSGFuZGxlci5qcyIsIlxyXG52YXIgZXZlbnROYW1lID0gJ2JlZm9yZXVubG9hZCc7XHJcblxyXG5jbGFzcyBXaW5kb3dVbmxvYWRIYW5kbGVyIHtcclxuICBjb25zdHJ1Y3RvciAod2luZG93LCBzdGF0ZSwgYnVmZmVyKSB7XHJcbiAgICB0aGlzLndpbmRvdyA9IHdpbmRvdztcclxuICAgIHRoaXMuc3RhdGUgPSBzdGF0ZTtcclxuICAgIHRoaXMuYnVmZmVyID0gYnVmZmVyO1xyXG5cclxuICAgIHRoaXMuaGFuZGxlciA9IHRoaXMuaGFuZGxlci5iaW5kKHRoaXMpO1xyXG4gIH1cclxuXHJcbiAgaGFuZGxlciAoZXZlbnQpIHtcclxuICAgIHZhciBkVCA9IHRoaXMuc3RhdGUuZ2V0RFQoZXZlbnQsIDIwKTtcclxuXHJcbiAgICAvLyAwYjEwMDFcclxuICAgIHRoaXMuYnVmZmVyLnB1c2goWzEyLCBkVF0sXHJcbiAgICAgIFs0LCAyMF0pO1xyXG4gIH07XHJcblxyXG4gIHN0YXJ0ICgpIHtcclxuICAgIHRoaXMud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCB0aGlzLmhhbmRsZXIsIGZhbHNlKTtcclxuICB9O1xyXG5cclxuICBzdG9wICgpIHtcclxuICAgIHRoaXMud2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCB0aGlzLmhhbmRsZXIsIGZhbHNlKTtcclxuICB9O1xyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgV2luZG93VW5sb2FkSGFuZGxlcjtcclxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3dpbmRvd1VubG9hZEhhbmRsZXIuanMiLCJ2YXIgc3RhdGVLZXk7XHJcbnZhciBldmVudEtleTtcclxuXHJcbnZhciBrZXlzID0ge1xyXG4gIGhpZGRlbjogJ3Zpc2liaWxpdHljaGFuZ2UnLFxyXG4gIHdlYmtpdEhpZGRlbjogJ3dlYmtpdHZpc2liaWxpdHljaGFuZ2UnLFxyXG4gIG1vekhpZGRlbjogJ21venZpc2liaWxpdHljaGFuZ2UnLFxyXG4gIG1zSGlkZGVuOiAnbXN2aXNpYmlsaXR5Y2hhbmdlJ1xyXG59O1xyXG5cclxuY2xhc3MgVmlzaWJpbGl0eUNoYW5nZUhhbmRsZXIge1xyXG4gIGNvbnN0cnVjdG9yICh3aW5kb3csIHN0YXRlLCBidWZmZXIpIHtcclxuICAgIHRoaXMud2luZG93ID0gd2luZG93O1xyXG4gICAgdGhpcy5zdGF0ZSA9IHN0YXRlO1xyXG4gICAgdGhpcy5idWZmZXIgPSBidWZmZXI7XHJcblxyXG4gICAgZm9yIChzdGF0ZUtleSBpbiBrZXlzKSB7XHJcbiAgICAgIGlmIChzdGF0ZUtleSBpbiB3aW5kb3cuZG9jdW1lbnQpIHtcclxuICAgICAgICBldmVudEtleSA9IGtleXNbc3RhdGVLZXldO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5oYW5kbGVyID0gdGhpcy5oYW5kbGVyLmJpbmQodGhpcyk7XHJcbiAgfVxyXG5cclxuICBoYW5kbGVyIChldmVudCkge1xyXG4gICAgdmFyIGRUID0gdGhpcy5zdGF0ZS5nZXREVChldmVudCwgMjApO1xyXG5cclxuICAgIGlmICh0aGlzLndpbmRvdy5kb2N1bWVudFtzdGF0ZUtleV0pIHsgLy8gaWRsZS9oaWRkZW4sIDBiMTAxMVxyXG4gICAgICB0aGlzLmJ1ZmZlci5wdXNoKFsxMSwgZFRdLFxyXG4gICAgICAgIFs0LCAyMF0pO1xyXG4gICAgfSBlbHNlIHsgLy8gZm9jdXNlZC92aXNpYmxlLCAwYjEwMTBcclxuICAgICAgdGhpcy5idWZmZXIucHVzaChbMTAsIGRUXSxcclxuICAgICAgICBbNCwgMjBdKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICBzdGFydCAoKSB7XHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihldmVudEtleSwgdGhpcy5oYW5kbGVyLCBmYWxzZSk7XHJcbiAgfTtcclxuXHJcbiAgc3RvcCAoKSB7XHJcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudEtleSwgdGhpcy5oYW5kbGVyLCBmYWxzZSk7XHJcbiAgfTtcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFZpc2liaWxpdHlDaGFuZ2VIYW5kbGVyO1xyXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvdmlzaWJpbGl0eUNoYW5nZUhhbmRsZXIuanMiLCJ2YXIgbWFwID0gJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky8nO1xyXG5cclxuLy8gQGNvbnN0YW50XHJcbnZhciBoZWFkID0gJ0JCJzsgLy8gdjIgOilcclxuXHJcbi8vIGJ1ZmZlclxyXG5cclxuLy8gTG9jYWxzLlxyXG52YXIgdXJsID0gJy9zJztcclxudmFyIGhlYWRlcnMgPSB7fTtcclxudmFyIHNlc3Npb25JRDtcclxudmFyIGNvdW50ZXIgPSAxO1xyXG5cclxuY2xhc3MgVHJhbnNwb3J0IHtcclxuICBjb25zdHJ1Y3RvciAod2luZG93KSB7XHJcbiAgICB0aGlzLndpbmRvdyA9IHdpbmRvdztcclxuICAgIHRoaXMuZW5jb2RlV3JhcHBlciA9IHdpbmRvdy5lbmNvZGVVUklDb21wb25lbnQ7XHJcbiAgICB0aGlzLmJ1ZmZlciA9ICcnO1xyXG4gICAgdGhpcy5zZW5kID0gdGhpcy5zZW5kLmJpbmQodGhpcyk7XHJcbiAgfVxyXG5cclxuICBlbmNvZGVWYWx1ZXMgKHZhbHVlcywgc2l6ZXMpIHtcclxuICAgIHZhciBpZHg7XHJcbiAgICB2YXIgbGVuID0gdmFsdWVzLmxlbmd0aDtcclxuICAgIHZhciBiYyA9IDA7IC8vIGJpdCBjb3VudGVyXHJcbiAgICB2YXIgY3Y7IC8vIGN1cnJlbnQgdmFsdWVcclxuICAgIHZhciBhdiA9IDA7IC8vIGFjdHVhbCB2YWx1ZVxyXG4gICAgdmFyIHNpemU7XHJcbiAgICB2YXIgcmVzdWx0cyA9ICcnO1xyXG5cclxuICAgIGZvciAoaWR4ID0gMDsgaWR4IDwgbGVuOyBpZHgrKykge1xyXG4gICAgICBjdiA9IHZhbHVlc1tpZHhdO1xyXG4gICAgICBzaXplID0gc2l6ZXNbaWR4XTtcclxuICAgICAgaWYgKGN2IDwgMCkgeyBjdiA9IDA7IH1cclxuICAgICAgaWYgKGN2ID4gKCgyIDw8IHNpemUpIC0gMSkpIHsgY3YgPSAoKDIgPDwgc2l6ZSkgLSAxKTsgfVxyXG4gICAgICBpZiAoYXYgPiAwKSB7XHJcbiAgICAgICAgYXYgPSBhdiA8PCBzaXplO1xyXG4gICAgICB9XHJcbiAgICAgIGF2IHw9IGN2ICYgKCgxIDw8IHNpemUpIC0gMSk7XHJcbiAgICAgIGJjICs9IHNpemU7XHJcbiAgICAgIHdoaWxlIChiYyA+IDYpIHtcclxuICAgICAgICBiYyAtPSA2O1xyXG4gICAgICAgIHJlc3VsdHMgKz0gbWFwW2F2ID4+PiBiY107XHJcbiAgICAgICAgYXYgJj0gKDEgPDwgYmMpIC0gMTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJlc3VsdHMgKz0gbWFwW2F2IDw8ICg2IC0gYmMpXTtcclxuXHJcbiAgICByZXR1cm4gcmVzdWx0cztcclxuICB9O1xyXG5cclxuICBlbmNvZGVIZWFkZXJzIChoZWFkZXJzKSB7XHJcbiAgICB2YXIgaGVhZGVyU3RyaW5nID0gJyc7XHJcblxyXG4gICAgZm9yICh2YXIga2V5IGluIGhlYWRlcnMpIHtcclxuICAgICAgaWYgKGhlYWRlcnMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xyXG4gICAgICAgIGhlYWRlclN0cmluZyA9IGhlYWRlclN0cmluZyArXHJcbiAgICAgICAgICB0aGlzLmVuY29kZVdyYXBwZXIoa2V5KSArICc9JyArXHJcbiAgICAgICAgICB0aGlzLmVuY29kZVdyYXBwZXIoaGVhZGVyc1trZXldKSArICcsJztcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzLmVuY29kZVZhbHVlcyhbaGVhZGVyU3RyaW5nLmxlbmd0aF0sIFsxMl0pICsgaGVhZGVyU3RyaW5nO1xyXG4gIH07XHJcblxyXG4gIC8qXHJcbiAgICogQHByaXZhdGVcclxuICAgKiBSZXNldHMgYnVmZmVyLlxyXG4gICAqL1xyXG4gIHJlc2V0ICgpIHtcclxuICAgIHRoaXMuYnVmZmVyID0gJyc7XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcblxyXG4gIC8qXHJcbiAgICogQHByaXZhdGVcclxuICAgKiBTaGlmdHMgYXZhaWxhYmxlIGRhdGEuICBUaGF0IG1lYW5zIHJlc2V0dGluZyB0byBpdHMgZGVmYXVsdHMgYW5kIHJldHVybmluZ1xyXG4gICAqIGFscmVhZHkgY29sbGVjdGVkIGV2ZW50cy5cclxuICAgKi9cclxuICBzaGlmdCAoKSB7XHJcbiAgICB2YXIgY29udGVudHMgPSB0aGlzLmJ1ZmZlcjtcclxuICAgIHRoaXMucmVzZXQoKTtcclxuICAgIHJldHVybiBjb250ZW50cztcclxuICB9XHJcblxyXG4gIC8qXHJcbiAgICogQHByaXZhdGVcclxuICAgKiBFbmNvZGVzIHJhdyBieXRlcyBpbnRvIHN0cmVhbSBmb3JtYXQgKGxlbmd0aCArIFVSSSBlbmNvZGVkIHN0cmluZ1xyXG4gICAqIHJlcHJlc2VudGF0aW9uKS5cclxuICAgKi9cclxuICBlbmNvZGVSYXdCeXRlcyAoYnl0ZXMpIHtcclxuICAgIHZhciBlbmNvZGVkID0gdGhpcy5lbmNvZGVXcmFwcGVyKGJ5dGVzKTtcclxuICAgIHJldHVybiB0aGlzLmVuY29kZVZhbHVlcyhbZW5jb2RlZC5sZW5ndGhdLCBbMTJdKSArIGVuY29kZWQ7XHJcbiAgfVxyXG5cclxuICBzZW5kIChzeW5jLCBjYWxsYmFjaykge1xyXG4gICAgdHJ5IHtcclxuICAgICAgdmFyIHggPSBuZXcgd2luZG93LlhNTEh0dHBSZXF1ZXN0KCk7XHJcbiAgICAgIHgub3BlbignUE9TVCcsIHVybCwgdHJ1ZSk7XHJcbiAgICAgIHguc2V0UmVxdWVzdEhlYWRlcignWC1SZXF1ZXN0ZWQtV2l0aCcsICdYTUxIdHRwUmVxdWVzdCcpO1xyXG4gICAgICB4LnNldFJlcXVlc3RIZWFkZXIoJ0NvbnRlbnQtdHlwZScsICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnKTtcclxuICAgICAgeC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7IC8vIENhbGwgYSBmdW5jdGlvbiB3aGVuIHRoZSBzdGF0ZSBjaGFuZ2VzLlxyXG4gICAgICAgIGlmIChjYWxsYmFjaykge1xyXG4gICAgICAgICAgY2FsbGJhY2soeCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgaGVhZGVyc1snc3RyZWFtLWlkJ10gPSAoc2Vzc2lvbklEKSArICcuJyArIChjb3VudGVyKyspO1xyXG4gICAgICB4LnNlbmQoaGVhZCArIHRoaXMuZW5jb2RlSGVhZGVycyhoZWFkZXJzKSArIHRoaXMuc2hpZnQoKSk7XHJcbiAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgIHdpbmRvdy5jb25zb2xlICYmIGNvbnNvbGUubG9nKGUpO1xyXG4gICAgfVxyXG4gIH07XHJcbiAgLyoqXHJcbiAgICogU2VuZHMgZGF0YSB0byBkZXN0aW5hdGlvbi5cclxuICAgKi9cclxuICAvLyBzZW5kKHN5bmMsIGNhbGxiYWNrKSB7XHJcbiAgLy8gICB2YXJcclxuICAvLyAgICAgcmVxID0gbmV3IHdpbmRvdy5YTUxIdHRwUmVxdWVzdCgpLFxyXG4gIC8vICAgICBvblJlc3BvbnNlID0gZnVuY3Rpb24gKCkge1xyXG4gIC8vICAgICAgIGlmIChjYWxsYmFjaykge1xyXG4gIC8vICAgICAgICAgaWYgKChyZXEucmVhZHlTdGF0ZSA9PT0gNCkgJiYgKHJlcS5zdGF0dXMgPT09IDIwMCkpIHtcclxuICAvLyAgICAgICAgICAgY2FsbGJhY2socmVxKTtcclxuICAvLyAgICAgICAgIH0gZWxzZSB7XHJcbiAgLy8gICAgICAgICAgIGNvbnNvbGUubG9nKFwiRmFpbHVyZVwiKVxyXG4gIC8vICAgICAgICAgfVxyXG4gIC8vICAgICAgIH1cclxuICAvLyAgICAgfSxcclxuICAvLyAgICAgb25TdWNjZXNzID0gZnVuY3Rpb24gKCkgeyBjb25zb2xlLmxvZyhcInN1Y2Nlc3NcIikgfSwgLy8gVE9ET1xyXG4gIC8vICAgICBvbkZhaWx1cmUgPSBmdW5jdGlvbiAoKSB7IGNvbnNvbGUubG9nKFwiRmFpbHVyZVwiKSB9OyAvLyBUT0RPXHJcblxyXG4gIC8vICAgLy8gVE9ETyBtYWtlIGl0IGNvbmZpZ3VyYWJsZSAoZW5hYmxlL2Rpc2FibGUpIHcvL29cclxuICAvLyAgIGhlYWRlcnNbXCJzdHJlYW0taWRcIl0gPSAoc2Vzc2lvbklEID8gc2Vzc2lvbklEIDogXCJcIikgKyBcIi5cIiArIChjb3VudGVyKyspO1xyXG5cclxuICAvLyAgIGlmIChcIndpdGhDcmVkZW50aWFsc1wiIGluIHJlcSkgeyAvLyBJcyBpdCBhIHJlYWwgWE1MSHR0cFJlcXVlc3QyIG9iamVjdFxyXG4gIC8vICAgICByZXEub3BlbihcIlBPU1RcIiwgdXJsLCAhc3luYyk7XHJcbiAgLy8gICAgIHJlcS5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBvblJlc3BvbnNlOyAvLyBUT0RPIFhNTEh0dHBSZXF1ZXN0MiBoYXMgb25sb2FkIGFuZCBjby4uLlxyXG4gIC8vICAgICByZXEuc2V0UmVxdWVzdEhlYWRlcihcIkNvbnRlbnQtdHlwZVwiLCBcInRleHQvcGxhaW5cIik7XHJcbiAgLy8gICAgIC8vIHJlcS53aXRoQ3JlZGVudGlhbHMgPSB0cnVlO1xyXG4gIC8vICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy53aW5kb3cuWERvbWFpblJlcXVlc3QgIT09IFwidW5kZWZpbmVkXCIpIHsgLy8gWERvbWFpblJlcXVlc3Qgb25seSBleGlzdHMgaW4gSUVcclxuICAvLyAgICAgcmVxID0gbmV3IHRoaXMud2luZG93LlhEb21haW5SZXF1ZXN0KCk7XHJcbiAgLy8gICAgIHJlcS5vbmxvYWQgPSBvblN1Y2Nlc3M7XHJcbiAgLy8gICAgIHJlcS5vbmVycm9yID0gb25GYWlsdXJlO1xyXG4gIC8vICAgICByZXEuY29udGVudFR5cGUgPSBcInRleHQvcGxhaW5cIjtcclxuICAvLyAgICAgcmVxLm9wZW4oXCJQT1NUXCIsIHVybCk7XHJcbiAgLy8gICB9IGVsc2UgaWYgKHR5cGVvZiB0aGlzLndpbmRvdy5BY3RpdmVYT2JqZWN0ICE9PSBcInVuZGVmaW5lZFwiKSB7IC8vIElzIGl0IE9LPyA6KVxyXG4gIC8vICAgICByZXEgPSBuZXcgdGhpcy53aW5kb3cuQWN0aXZlWE9iamVjdChcIk1pY3Jvc29mdC5YTUxIVFRQXCIpO1xyXG4gIC8vICAgICByZXEub3BlbihcIlBPU1RcIiwgdXJsKTtcclxuICAvLyAgIH0gZWxzZSB7XHJcbiAgLy8gICAgIC8vIFRPRE8gRmlyZWZveCBpbiB0ZXN0IG1vZGUgZ2V0IHRvIHRoaXMgYnJhbmNoXHJcbiAgLy8gICAgIHJlcS5vcGVuKFwiUE9TVFwiLCB1cmwsICFzeW5jKTtcclxuICAvLyAgICAgcmVxLm9ubG9hZCA9IG9uUmVzcG9uc2U7XHJcbiAgLy8gICAgIHJlcS5zZXRSZXF1ZXN0SGVhZGVyKFwiQ29udGVudC10eXBlXCIsIFwidGV4dC9wbGFpblwiKTtcclxuICAvLyAgICAgLy9yZXEgPSBudWxsO1xyXG4gIC8vICAgICAvL3Rocm93IG5ldyBFcnJvcignQ09SUyBub3Qgc3VwcG9ydGVkJyk7IC8vIFRPRE9cclxuICAvLyAgIH1cclxuICAvLyAgIGNvbnNvbGUubG9nKGhlYWQgKyB0aGlzLmVuY29kZUhlYWRlcnMoaGVhZGVycykgKyB0aGlzLnNoaWZ0KCkpO1xyXG4gIC8vICAgcmVxLnNlbmQoaGVhZCArIHRoaXMuZW5jb2RlSGVhZGVycyhoZWFkZXJzKSArIHRoaXMuc2hpZnQoKSk7XHJcblxyXG4gIC8vICAgcmV0dXJuIHRydWU7XHJcbiAgLy8gfTtcclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyBkZXN0aW5hdGlvbiBVUkwuXHJcbiAgICovXHJcbiAgc2V0VXJsICh1KSB7XHJcbiAgICB1cmwgPSB1O1xyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgcmVxdWVzdCBoZWFkZXIgay92IHBhaXIuXHJcbiAgICovXHJcbiAgc2V0SGVhZGVyIChrZXksIHZhbHVlKSB7XHJcbiAgICBoZWFkZXJzW2tleV0gPSB2YWx1ZTtcclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHNlc3Npb24gSUQgZm9yIHRoaXMgc2Vzc2lvbi5cclxuICAgKi9cclxuICBzZXRTZXNzaW9uSUQgKHMpIHtcclxuICAgIHNlc3Npb25JRCA9IHM7XHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBjdXJyZW50IGJ1ZmZlciBjb250ZW50cyAod2l0aG91dCB2ZXJzaW9uIG1hZ2ljIGFuZCBoZWFkZXJzKS5cclxuICAgKi9cclxuICBnZXRCdWZmZXIgKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuYnVmZmVyO1xyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIEVuY29kZXMgYW5kIHB1c2hlcyB2YWx1ZXMgc2FtcGxlZCBieSBpdHMgZ2l2ZW4gc2l6ZSBpbnRvIGJ1ZmZlci5cclxuICAgKi9cclxuICBwdXNoICh2YWx1ZXMsIHNpemVzKSB7XHJcbiAgICB0aGlzLmJ1ZmZlciArPSB0aGlzLmVuY29kZVZhbHVlcyh2YWx1ZXMsIHNpemVzKTtcclxuICAgIHJldHVybiB0aGlzLmJ1ZmZlcjtcclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBFbmNvZGVzIHJhdyBieXRlcyBpbnRvIHN0cmVhbSBmb3JtYXQgKGxlbmd0aCArIFVSSSBlbmNvZGVkIHN0cmluZ1xyXG4gICAqIHJlcHJlc2VudGF0aW9uKS5cclxuICAgKi9cclxuICAvLyB0aGlzLmVuY29kZVJhd0J5dGVzID0gZW5jb2RlUmF3Qnl0ZXM7XHJcblxyXG4gIC8qKlxyXG4gICAqIEFwcGVuZHMgcmF3IChlbmNvZGVkKSBieXRlcyB0byBidWZmZXIuXHJcbiAgICovXHJcbiAgcHVzaFJhd0J5dGVzIChieXRlcykge1xyXG4gICAgdGhpcy5idWZmZXIgKz0gdGhpcy5lbmNvZGVSYXdCeXRlcyhieXRlcyk7XHJcbiAgICByZXR1cm4gdGhpcy5idWZmZXI7XHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogUmVzZXRzIGJ1ZmZlci5cclxuICAgKi9cclxuICAvLyB0aGlzLnJlc2V0ID0gcmVzZXQ7XHJcblxyXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgVHJhbnNwb3J0O1xyXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvdHJhbnNwb3J0LmpzIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbnZhciBmb3JtYXRSZWdFeHAgPSAvJVtzZGolXS9nO1xuZXhwb3J0cy5mb3JtYXQgPSBmdW5jdGlvbihmKSB7XG4gIGlmICghaXNTdHJpbmcoZikpIHtcbiAgICB2YXIgb2JqZWN0cyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBvYmplY3RzLnB1c2goaW5zcGVjdChhcmd1bWVudHNbaV0pKTtcbiAgICB9XG4gICAgcmV0dXJuIG9iamVjdHMuam9pbignICcpO1xuICB9XG5cbiAgdmFyIGkgPSAxO1xuICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgdmFyIGxlbiA9IGFyZ3MubGVuZ3RoO1xuICB2YXIgc3RyID0gU3RyaW5nKGYpLnJlcGxhY2UoZm9ybWF0UmVnRXhwLCBmdW5jdGlvbih4KSB7XG4gICAgaWYgKHggPT09ICclJScpIHJldHVybiAnJSc7XG4gICAgaWYgKGkgPj0gbGVuKSByZXR1cm4geDtcbiAgICBzd2l0Y2ggKHgpIHtcbiAgICAgIGNhc2UgJyVzJzogcmV0dXJuIFN0cmluZyhhcmdzW2krK10pO1xuICAgICAgY2FzZSAnJWQnOiByZXR1cm4gTnVtYmVyKGFyZ3NbaSsrXSk7XG4gICAgICBjYXNlICclaic6XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KGFyZ3NbaSsrXSk7XG4gICAgICAgIH0gY2F0Y2ggKF8pIHtcbiAgICAgICAgICByZXR1cm4gJ1tDaXJjdWxhcl0nO1xuICAgICAgICB9XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4geDtcbiAgICB9XG4gIH0pO1xuICBmb3IgKHZhciB4ID0gYXJnc1tpXTsgaSA8IGxlbjsgeCA9IGFyZ3NbKytpXSkge1xuICAgIGlmIChpc051bGwoeCkgfHwgIWlzT2JqZWN0KHgpKSB7XG4gICAgICBzdHIgKz0gJyAnICsgeDtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RyICs9ICcgJyArIGluc3BlY3QoeCk7XG4gICAgfVxuICB9XG4gIHJldHVybiBzdHI7XG59O1xuXG5cbi8vIE1hcmsgdGhhdCBhIG1ldGhvZCBzaG91bGQgbm90IGJlIHVzZWQuXG4vLyBSZXR1cm5zIGEgbW9kaWZpZWQgZnVuY3Rpb24gd2hpY2ggd2FybnMgb25jZSBieSBkZWZhdWx0LlxuLy8gSWYgLS1uby1kZXByZWNhdGlvbiBpcyBzZXQsIHRoZW4gaXQgaXMgYSBuby1vcC5cbmV4cG9ydHMuZGVwcmVjYXRlID0gZnVuY3Rpb24oZm4sIG1zZykge1xuICAvLyBBbGxvdyBmb3IgZGVwcmVjYXRpbmcgdGhpbmdzIGluIHRoZSBwcm9jZXNzIG9mIHN0YXJ0aW5nIHVwLlxuICBpZiAoaXNVbmRlZmluZWQoZ2xvYmFsLnByb2Nlc3MpKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGV4cG9ydHMuZGVwcmVjYXRlKGZuLCBtc2cpLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfTtcbiAgfVxuXG4gIGlmIChwcm9jZXNzLm5vRGVwcmVjYXRpb24gPT09IHRydWUpIHtcbiAgICByZXR1cm4gZm47XG4gIH1cblxuICB2YXIgd2FybmVkID0gZmFsc2U7XG4gIGZ1bmN0aW9uIGRlcHJlY2F0ZWQoKSB7XG4gICAgaWYgKCF3YXJuZWQpIHtcbiAgICAgIGlmIChwcm9jZXNzLnRocm93RGVwcmVjYXRpb24pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKG1zZyk7XG4gICAgICB9IGVsc2UgaWYgKHByb2Nlc3MudHJhY2VEZXByZWNhdGlvbikge1xuICAgICAgICBjb25zb2xlLnRyYWNlKG1zZyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmVycm9yKG1zZyk7XG4gICAgICB9XG4gICAgICB3YXJuZWQgPSB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuXG4gIHJldHVybiBkZXByZWNhdGVkO1xufTtcblxuXG52YXIgZGVidWdzID0ge307XG52YXIgZGVidWdFbnZpcm9uO1xuZXhwb3J0cy5kZWJ1Z2xvZyA9IGZ1bmN0aW9uKHNldCkge1xuICBpZiAoaXNVbmRlZmluZWQoZGVidWdFbnZpcm9uKSlcbiAgICBkZWJ1Z0Vudmlyb24gPSBwcm9jZXNzLmVudi5OT0RFX0RFQlVHIHx8ICcnO1xuICBzZXQgPSBzZXQudG9VcHBlckNhc2UoKTtcbiAgaWYgKCFkZWJ1Z3Nbc2V0XSkge1xuICAgIGlmIChuZXcgUmVnRXhwKCdcXFxcYicgKyBzZXQgKyAnXFxcXGInLCAnaScpLnRlc3QoZGVidWdFbnZpcm9uKSkge1xuICAgICAgdmFyIHBpZCA9IHByb2Nlc3MucGlkO1xuICAgICAgZGVidWdzW3NldF0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG1zZyA9IGV4cG9ydHMuZm9ybWF0LmFwcGx5KGV4cG9ydHMsIGFyZ3VtZW50cyk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJyVzICVkOiAlcycsIHNldCwgcGlkLCBtc2cpO1xuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgZGVidWdzW3NldF0gPSBmdW5jdGlvbigpIHt9O1xuICAgIH1cbiAgfVxuICByZXR1cm4gZGVidWdzW3NldF07XG59O1xuXG5cbi8qKlxuICogRWNob3MgdGhlIHZhbHVlIG9mIGEgdmFsdWUuIFRyeXMgdG8gcHJpbnQgdGhlIHZhbHVlIG91dFxuICogaW4gdGhlIGJlc3Qgd2F5IHBvc3NpYmxlIGdpdmVuIHRoZSBkaWZmZXJlbnQgdHlwZXMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iaiBUaGUgb2JqZWN0IHRvIHByaW50IG91dC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRzIE9wdGlvbmFsIG9wdGlvbnMgb2JqZWN0IHRoYXQgYWx0ZXJzIHRoZSBvdXRwdXQuXG4gKi9cbi8qIGxlZ2FjeTogb2JqLCBzaG93SGlkZGVuLCBkZXB0aCwgY29sb3JzKi9cbmZ1bmN0aW9uIGluc3BlY3Qob2JqLCBvcHRzKSB7XG4gIC8vIGRlZmF1bHQgb3B0aW9uc1xuICB2YXIgY3R4ID0ge1xuICAgIHNlZW46IFtdLFxuICAgIHN0eWxpemU6IHN0eWxpemVOb0NvbG9yXG4gIH07XG4gIC8vIGxlZ2FjeS4uLlxuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+PSAzKSBjdHguZGVwdGggPSBhcmd1bWVudHNbMl07XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID49IDQpIGN0eC5jb2xvcnMgPSBhcmd1bWVudHNbM107XG4gIGlmIChpc0Jvb2xlYW4ob3B0cykpIHtcbiAgICAvLyBsZWdhY3kuLi5cbiAgICBjdHguc2hvd0hpZGRlbiA9IG9wdHM7XG4gIH0gZWxzZSBpZiAob3B0cykge1xuICAgIC8vIGdvdCBhbiBcIm9wdGlvbnNcIiBvYmplY3RcbiAgICBleHBvcnRzLl9leHRlbmQoY3R4LCBvcHRzKTtcbiAgfVxuICAvLyBzZXQgZGVmYXVsdCBvcHRpb25zXG4gIGlmIChpc1VuZGVmaW5lZChjdHguc2hvd0hpZGRlbikpIGN0eC5zaG93SGlkZGVuID0gZmFsc2U7XG4gIGlmIChpc1VuZGVmaW5lZChjdHguZGVwdGgpKSBjdHguZGVwdGggPSAyO1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LmNvbG9ycykpIGN0eC5jb2xvcnMgPSBmYWxzZTtcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5jdXN0b21JbnNwZWN0KSkgY3R4LmN1c3RvbUluc3BlY3QgPSB0cnVlO1xuICBpZiAoY3R4LmNvbG9ycykgY3R4LnN0eWxpemUgPSBzdHlsaXplV2l0aENvbG9yO1xuICByZXR1cm4gZm9ybWF0VmFsdWUoY3R4LCBvYmosIGN0eC5kZXB0aCk7XG59XG5leHBvcnRzLmluc3BlY3QgPSBpbnNwZWN0O1xuXG5cbi8vIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvQU5TSV9lc2NhcGVfY29kZSNncmFwaGljc1xuaW5zcGVjdC5jb2xvcnMgPSB7XG4gICdib2xkJyA6IFsxLCAyMl0sXG4gICdpdGFsaWMnIDogWzMsIDIzXSxcbiAgJ3VuZGVybGluZScgOiBbNCwgMjRdLFxuICAnaW52ZXJzZScgOiBbNywgMjddLFxuICAnd2hpdGUnIDogWzM3LCAzOV0sXG4gICdncmV5JyA6IFs5MCwgMzldLFxuICAnYmxhY2snIDogWzMwLCAzOV0sXG4gICdibHVlJyA6IFszNCwgMzldLFxuICAnY3lhbicgOiBbMzYsIDM5XSxcbiAgJ2dyZWVuJyA6IFszMiwgMzldLFxuICAnbWFnZW50YScgOiBbMzUsIDM5XSxcbiAgJ3JlZCcgOiBbMzEsIDM5XSxcbiAgJ3llbGxvdycgOiBbMzMsIDM5XVxufTtcblxuLy8gRG9uJ3QgdXNlICdibHVlJyBub3QgdmlzaWJsZSBvbiBjbWQuZXhlXG5pbnNwZWN0LnN0eWxlcyA9IHtcbiAgJ3NwZWNpYWwnOiAnY3lhbicsXG4gICdudW1iZXInOiAneWVsbG93JyxcbiAgJ2Jvb2xlYW4nOiAneWVsbG93JyxcbiAgJ3VuZGVmaW5lZCc6ICdncmV5JyxcbiAgJ251bGwnOiAnYm9sZCcsXG4gICdzdHJpbmcnOiAnZ3JlZW4nLFxuICAnZGF0ZSc6ICdtYWdlbnRhJyxcbiAgLy8gXCJuYW1lXCI6IGludGVudGlvbmFsbHkgbm90IHN0eWxpbmdcbiAgJ3JlZ2V4cCc6ICdyZWQnXG59O1xuXG5cbmZ1bmN0aW9uIHN0eWxpemVXaXRoQ29sb3Ioc3RyLCBzdHlsZVR5cGUpIHtcbiAgdmFyIHN0eWxlID0gaW5zcGVjdC5zdHlsZXNbc3R5bGVUeXBlXTtcblxuICBpZiAoc3R5bGUpIHtcbiAgICByZXR1cm4gJ1xcdTAwMWJbJyArIGluc3BlY3QuY29sb3JzW3N0eWxlXVswXSArICdtJyArIHN0ciArXG4gICAgICAgICAgICdcXHUwMDFiWycgKyBpbnNwZWN0LmNvbG9yc1tzdHlsZV1bMV0gKyAnbSc7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHN0cjtcbiAgfVxufVxuXG5cbmZ1bmN0aW9uIHN0eWxpemVOb0NvbG9yKHN0ciwgc3R5bGVUeXBlKSB7XG4gIHJldHVybiBzdHI7XG59XG5cblxuZnVuY3Rpb24gYXJyYXlUb0hhc2goYXJyYXkpIHtcbiAgdmFyIGhhc2ggPSB7fTtcblxuICBhcnJheS5mb3JFYWNoKGZ1bmN0aW9uKHZhbCwgaWR4KSB7XG4gICAgaGFzaFt2YWxdID0gdHJ1ZTtcbiAgfSk7XG5cbiAgcmV0dXJuIGhhc2g7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0VmFsdWUoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzKSB7XG4gIC8vIFByb3ZpZGUgYSBob29rIGZvciB1c2VyLXNwZWNpZmllZCBpbnNwZWN0IGZ1bmN0aW9ucy5cbiAgLy8gQ2hlY2sgdGhhdCB2YWx1ZSBpcyBhbiBvYmplY3Qgd2l0aCBhbiBpbnNwZWN0IGZ1bmN0aW9uIG9uIGl0XG4gIGlmIChjdHguY3VzdG9tSW5zcGVjdCAmJlxuICAgICAgdmFsdWUgJiZcbiAgICAgIGlzRnVuY3Rpb24odmFsdWUuaW5zcGVjdCkgJiZcbiAgICAgIC8vIEZpbHRlciBvdXQgdGhlIHV0aWwgbW9kdWxlLCBpdCdzIGluc3BlY3QgZnVuY3Rpb24gaXMgc3BlY2lhbFxuICAgICAgdmFsdWUuaW5zcGVjdCAhPT0gZXhwb3J0cy5pbnNwZWN0ICYmXG4gICAgICAvLyBBbHNvIGZpbHRlciBvdXQgYW55IHByb3RvdHlwZSBvYmplY3RzIHVzaW5nIHRoZSBjaXJjdWxhciBjaGVjay5cbiAgICAgICEodmFsdWUuY29uc3RydWN0b3IgJiYgdmFsdWUuY29uc3RydWN0b3IucHJvdG90eXBlID09PSB2YWx1ZSkpIHtcbiAgICB2YXIgcmV0ID0gdmFsdWUuaW5zcGVjdChyZWN1cnNlVGltZXMsIGN0eCk7XG4gICAgaWYgKCFpc1N0cmluZyhyZXQpKSB7XG4gICAgICByZXQgPSBmb3JtYXRWYWx1ZShjdHgsIHJldCwgcmVjdXJzZVRpbWVzKTtcbiAgICB9XG4gICAgcmV0dXJuIHJldDtcbiAgfVxuXG4gIC8vIFByaW1pdGl2ZSB0eXBlcyBjYW5ub3QgaGF2ZSBwcm9wZXJ0aWVzXG4gIHZhciBwcmltaXRpdmUgPSBmb3JtYXRQcmltaXRpdmUoY3R4LCB2YWx1ZSk7XG4gIGlmIChwcmltaXRpdmUpIHtcbiAgICByZXR1cm4gcHJpbWl0aXZlO1xuICB9XG5cbiAgLy8gTG9vayB1cCB0aGUga2V5cyBvZiB0aGUgb2JqZWN0LlxuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHZhbHVlKTtcbiAgdmFyIHZpc2libGVLZXlzID0gYXJyYXlUb0hhc2goa2V5cyk7XG5cbiAgaWYgKGN0eC5zaG93SGlkZGVuKSB7XG4gICAga2V5cyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHZhbHVlKTtcbiAgfVxuXG4gIC8vIElFIGRvZXNuJ3QgbWFrZSBlcnJvciBmaWVsZHMgbm9uLWVudW1lcmFibGVcbiAgLy8gaHR0cDovL21zZG4ubWljcm9zb2Z0LmNvbS9lbi11cy9saWJyYXJ5L2llL2R3dzUyc2J0KHY9dnMuOTQpLmFzcHhcbiAgaWYgKGlzRXJyb3IodmFsdWUpXG4gICAgICAmJiAoa2V5cy5pbmRleE9mKCdtZXNzYWdlJykgPj0gMCB8fCBrZXlzLmluZGV4T2YoJ2Rlc2NyaXB0aW9uJykgPj0gMCkpIHtcbiAgICByZXR1cm4gZm9ybWF0RXJyb3IodmFsdWUpO1xuICB9XG5cbiAgLy8gU29tZSB0eXBlIG9mIG9iamVjdCB3aXRob3V0IHByb3BlcnRpZXMgY2FuIGJlIHNob3J0Y3V0dGVkLlxuICBpZiAoa2V5cy5sZW5ndGggPT09IDApIHtcbiAgICBpZiAoaXNGdW5jdGlvbih2YWx1ZSkpIHtcbiAgICAgIHZhciBuYW1lID0gdmFsdWUubmFtZSA/ICc6ICcgKyB2YWx1ZS5uYW1lIDogJyc7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoJ1tGdW5jdGlvbicgKyBuYW1lICsgJ10nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgICBpZiAoaXNSZWdFeHAodmFsdWUpKSB7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoUmVnRXhwLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSwgJ3JlZ2V4cCcpO1xuICAgIH1cbiAgICBpZiAoaXNEYXRlKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKERhdGUucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpLCAnZGF0ZScpO1xuICAgIH1cbiAgICBpZiAoaXNFcnJvcih2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBmb3JtYXRFcnJvcih2YWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgdmFyIGJhc2UgPSAnJywgYXJyYXkgPSBmYWxzZSwgYnJhY2VzID0gWyd7JywgJ30nXTtcblxuICAvLyBNYWtlIEFycmF5IHNheSB0aGF0IHRoZXkgYXJlIEFycmF5XG4gIGlmIChpc0FycmF5KHZhbHVlKSkge1xuICAgIGFycmF5ID0gdHJ1ZTtcbiAgICBicmFjZXMgPSBbJ1snLCAnXSddO1xuICB9XG5cbiAgLy8gTWFrZSBmdW5jdGlvbnMgc2F5IHRoYXQgdGhleSBhcmUgZnVuY3Rpb25zXG4gIGlmIChpc0Z1bmN0aW9uKHZhbHVlKSkge1xuICAgIHZhciBuID0gdmFsdWUubmFtZSA/ICc6ICcgKyB2YWx1ZS5uYW1lIDogJyc7XG4gICAgYmFzZSA9ICcgW0Z1bmN0aW9uJyArIG4gKyAnXSc7XG4gIH1cblxuICAvLyBNYWtlIFJlZ0V4cHMgc2F5IHRoYXQgdGhleSBhcmUgUmVnRXhwc1xuICBpZiAoaXNSZWdFeHAodmFsdWUpKSB7XG4gICAgYmFzZSA9ICcgJyArIFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSk7XG4gIH1cblxuICAvLyBNYWtlIGRhdGVzIHdpdGggcHJvcGVydGllcyBmaXJzdCBzYXkgdGhlIGRhdGVcbiAgaWYgKGlzRGF0ZSh2YWx1ZSkpIHtcbiAgICBiYXNlID0gJyAnICsgRGF0ZS5wcm90b3R5cGUudG9VVENTdHJpbmcuY2FsbCh2YWx1ZSk7XG4gIH1cblxuICAvLyBNYWtlIGVycm9yIHdpdGggbWVzc2FnZSBmaXJzdCBzYXkgdGhlIGVycm9yXG4gIGlmIChpc0Vycm9yKHZhbHVlKSkge1xuICAgIGJhc2UgPSAnICcgKyBmb3JtYXRFcnJvcih2YWx1ZSk7XG4gIH1cblxuICBpZiAoa2V5cy5sZW5ndGggPT09IDAgJiYgKCFhcnJheSB8fCB2YWx1ZS5sZW5ndGggPT0gMCkpIHtcbiAgICByZXR1cm4gYnJhY2VzWzBdICsgYmFzZSArIGJyYWNlc1sxXTtcbiAgfVxuXG4gIGlmIChyZWN1cnNlVGltZXMgPCAwKSB7XG4gICAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSksICdyZWdleHAnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKCdbT2JqZWN0XScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9XG5cbiAgY3R4LnNlZW4ucHVzaCh2YWx1ZSk7XG5cbiAgdmFyIG91dHB1dDtcbiAgaWYgKGFycmF5KSB7XG4gICAgb3V0cHV0ID0gZm9ybWF0QXJyYXkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5cyk7XG4gIH0gZWxzZSB7XG4gICAgb3V0cHV0ID0ga2V5cy5tYXAoZnVuY3Rpb24oa2V5KSB7XG4gICAgICByZXR1cm4gZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5LCBhcnJheSk7XG4gICAgfSk7XG4gIH1cblxuICBjdHguc2Vlbi5wb3AoKTtcblxuICByZXR1cm4gcmVkdWNlVG9TaW5nbGVTdHJpbmcob3V0cHV0LCBiYXNlLCBicmFjZXMpO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdFByaW1pdGl2ZShjdHgsIHZhbHVlKSB7XG4gIGlmIChpc1VuZGVmaW5lZCh2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCd1bmRlZmluZWQnLCAndW5kZWZpbmVkJyk7XG4gIGlmIChpc1N0cmluZyh2YWx1ZSkpIHtcbiAgICB2YXIgc2ltcGxlID0gJ1xcJycgKyBKU09OLnN0cmluZ2lmeSh2YWx1ZSkucmVwbGFjZSgvXlwifFwiJC9nLCAnJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC8nL2csIFwiXFxcXCdcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXFxcXCIvZywgJ1wiJykgKyAnXFwnJztcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoc2ltcGxlLCAnc3RyaW5nJyk7XG4gIH1cbiAgaWYgKGlzTnVtYmVyKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJycgKyB2YWx1ZSwgJ251bWJlcicpO1xuICBpZiAoaXNCb29sZWFuKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJycgKyB2YWx1ZSwgJ2Jvb2xlYW4nKTtcbiAgLy8gRm9yIHNvbWUgcmVhc29uIHR5cGVvZiBudWxsIGlzIFwib2JqZWN0XCIsIHNvIHNwZWNpYWwgY2FzZSBoZXJlLlxuICBpZiAoaXNOdWxsKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJ251bGwnLCAnbnVsbCcpO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdEVycm9yKHZhbHVlKSB7XG4gIHJldHVybiAnWycgKyBFcnJvci5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSkgKyAnXSc7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0QXJyYXkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5cykge1xuICB2YXIgb3V0cHV0ID0gW107XG4gIGZvciAodmFyIGkgPSAwLCBsID0gdmFsdWUubGVuZ3RoOyBpIDwgbDsgKytpKSB7XG4gICAgaWYgKGhhc093blByb3BlcnR5KHZhbHVlLCBTdHJpbmcoaSkpKSB7XG4gICAgICBvdXRwdXQucHVzaChmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLFxuICAgICAgICAgIFN0cmluZyhpKSwgdHJ1ZSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXRwdXQucHVzaCgnJyk7XG4gICAgfVxuICB9XG4gIGtleXMuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICBpZiAoIWtleS5tYXRjaCgvXlxcZCskLykpIHtcbiAgICAgIG91dHB1dC5wdXNoKGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsXG4gICAgICAgICAga2V5LCB0cnVlKSk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIG91dHB1dDtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLCBrZXksIGFycmF5KSB7XG4gIHZhciBuYW1lLCBzdHIsIGRlc2M7XG4gIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHZhbHVlLCBrZXkpIHx8IHsgdmFsdWU6IHZhbHVlW2tleV0gfTtcbiAgaWYgKGRlc2MuZ2V0KSB7XG4gICAgaWYgKGRlc2Muc2V0KSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW0dldHRlci9TZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tHZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaWYgKGRlc2Muc2V0KSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW1NldHRlcl0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfVxuICBpZiAoIWhhc093blByb3BlcnR5KHZpc2libGVLZXlzLCBrZXkpKSB7XG4gICAgbmFtZSA9ICdbJyArIGtleSArICddJztcbiAgfVxuICBpZiAoIXN0cikge1xuICAgIGlmIChjdHguc2Vlbi5pbmRleE9mKGRlc2MudmFsdWUpIDwgMCkge1xuICAgICAgaWYgKGlzTnVsbChyZWN1cnNlVGltZXMpKSB7XG4gICAgICAgIHN0ciA9IGZvcm1hdFZhbHVlKGN0eCwgZGVzYy52YWx1ZSwgbnVsbCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzdHIgPSBmb3JtYXRWYWx1ZShjdHgsIGRlc2MudmFsdWUsIHJlY3Vyc2VUaW1lcyAtIDEpO1xuICAgICAgfVxuICAgICAgaWYgKHN0ci5pbmRleE9mKCdcXG4nKSA+IC0xKSB7XG4gICAgICAgIGlmIChhcnJheSkge1xuICAgICAgICAgIHN0ciA9IHN0ci5zcGxpdCgnXFxuJykubWFwKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgICAgICAgIHJldHVybiAnICAnICsgbGluZTtcbiAgICAgICAgICB9KS5qb2luKCdcXG4nKS5zdWJzdHIoMik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3RyID0gJ1xcbicgKyBzdHIuc3BsaXQoJ1xcbicpLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgICAgICByZXR1cm4gJyAgICcgKyBsaW5lO1xuICAgICAgICAgIH0pLmpvaW4oJ1xcbicpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbQ2lyY3VsYXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH1cbiAgaWYgKGlzVW5kZWZpbmVkKG5hbWUpKSB7XG4gICAgaWYgKGFycmF5ICYmIGtleS5tYXRjaCgvXlxcZCskLykpIHtcbiAgICAgIHJldHVybiBzdHI7XG4gICAgfVxuICAgIG5hbWUgPSBKU09OLnN0cmluZ2lmeSgnJyArIGtleSk7XG4gICAgaWYgKG5hbWUubWF0Y2goL15cIihbYS16QS1aX11bYS16QS1aXzAtOV0qKVwiJC8pKSB7XG4gICAgICBuYW1lID0gbmFtZS5zdWJzdHIoMSwgbmFtZS5sZW5ndGggLSAyKTtcbiAgICAgIG5hbWUgPSBjdHguc3R5bGl6ZShuYW1lLCAnbmFtZScpO1xuICAgIH0gZWxzZSB7XG4gICAgICBuYW1lID0gbmFtZS5yZXBsYWNlKC8nL2csIFwiXFxcXCdcIilcbiAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcXFxcIi9nLCAnXCInKVxuICAgICAgICAgICAgICAgICAucmVwbGFjZSgvKF5cInxcIiQpL2csIFwiJ1wiKTtcbiAgICAgIG5hbWUgPSBjdHguc3R5bGl6ZShuYW1lLCAnc3RyaW5nJyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5hbWUgKyAnOiAnICsgc3RyO1xufVxuXG5cbmZ1bmN0aW9uIHJlZHVjZVRvU2luZ2xlU3RyaW5nKG91dHB1dCwgYmFzZSwgYnJhY2VzKSB7XG4gIHZhciBudW1MaW5lc0VzdCA9IDA7XG4gIHZhciBsZW5ndGggPSBvdXRwdXQucmVkdWNlKGZ1bmN0aW9uKHByZXYsIGN1cikge1xuICAgIG51bUxpbmVzRXN0Kys7XG4gICAgaWYgKGN1ci5pbmRleE9mKCdcXG4nKSA+PSAwKSBudW1MaW5lc0VzdCsrO1xuICAgIHJldHVybiBwcmV2ICsgY3VyLnJlcGxhY2UoL1xcdTAwMWJcXFtcXGRcXGQ/bS9nLCAnJykubGVuZ3RoICsgMTtcbiAgfSwgMCk7XG5cbiAgaWYgKGxlbmd0aCA+IDYwKSB7XG4gICAgcmV0dXJuIGJyYWNlc1swXSArXG4gICAgICAgICAgIChiYXNlID09PSAnJyA/ICcnIDogYmFzZSArICdcXG4gJykgK1xuICAgICAgICAgICAnICcgK1xuICAgICAgICAgICBvdXRwdXQuam9pbignLFxcbiAgJykgK1xuICAgICAgICAgICAnICcgK1xuICAgICAgICAgICBicmFjZXNbMV07XG4gIH1cblxuICByZXR1cm4gYnJhY2VzWzBdICsgYmFzZSArICcgJyArIG91dHB1dC5qb2luKCcsICcpICsgJyAnICsgYnJhY2VzWzFdO1xufVxuXG5cbi8vIE5PVEU6IFRoZXNlIHR5cGUgY2hlY2tpbmcgZnVuY3Rpb25zIGludGVudGlvbmFsbHkgZG9uJ3QgdXNlIGBpbnN0YW5jZW9mYFxuLy8gYmVjYXVzZSBpdCBpcyBmcmFnaWxlIGFuZCBjYW4gYmUgZWFzaWx5IGZha2VkIHdpdGggYE9iamVjdC5jcmVhdGUoKWAuXG5mdW5jdGlvbiBpc0FycmF5KGFyKSB7XG4gIHJldHVybiBBcnJheS5pc0FycmF5KGFyKTtcbn1cbmV4cG9ydHMuaXNBcnJheSA9IGlzQXJyYXk7XG5cbmZ1bmN0aW9uIGlzQm9vbGVhbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdib29sZWFuJztcbn1cbmV4cG9ydHMuaXNCb29sZWFuID0gaXNCb29sZWFuO1xuXG5mdW5jdGlvbiBpc051bGwoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IG51bGw7XG59XG5leHBvcnRzLmlzTnVsbCA9IGlzTnVsbDtcblxuZnVuY3Rpb24gaXNOdWxsT3JVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT0gbnVsbDtcbn1cbmV4cG9ydHMuaXNOdWxsT3JVbmRlZmluZWQgPSBpc051bGxPclVuZGVmaW5lZDtcblxuZnVuY3Rpb24gaXNOdW1iZXIoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnbnVtYmVyJztcbn1cbmV4cG9ydHMuaXNOdW1iZXIgPSBpc051bWJlcjtcblxuZnVuY3Rpb24gaXNTdHJpbmcoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnc3RyaW5nJztcbn1cbmV4cG9ydHMuaXNTdHJpbmcgPSBpc1N0cmluZztcblxuZnVuY3Rpb24gaXNTeW1ib2woYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnc3ltYm9sJztcbn1cbmV4cG9ydHMuaXNTeW1ib2wgPSBpc1N5bWJvbDtcblxuZnVuY3Rpb24gaXNVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IHZvaWQgMDtcbn1cbmV4cG9ydHMuaXNVbmRlZmluZWQgPSBpc1VuZGVmaW5lZDtcblxuZnVuY3Rpb24gaXNSZWdFeHAocmUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KHJlKSAmJiBvYmplY3RUb1N0cmluZyhyZSkgPT09ICdbb2JqZWN0IFJlZ0V4cF0nO1xufVxuZXhwb3J0cy5pc1JlZ0V4cCA9IGlzUmVnRXhwO1xuXG5mdW5jdGlvbiBpc09iamVjdChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnICYmIGFyZyAhPT0gbnVsbDtcbn1cbmV4cG9ydHMuaXNPYmplY3QgPSBpc09iamVjdDtcblxuZnVuY3Rpb24gaXNEYXRlKGQpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KGQpICYmIG9iamVjdFRvU3RyaW5nKGQpID09PSAnW29iamVjdCBEYXRlXSc7XG59XG5leHBvcnRzLmlzRGF0ZSA9IGlzRGF0ZTtcblxuZnVuY3Rpb24gaXNFcnJvcihlKSB7XG4gIHJldHVybiBpc09iamVjdChlKSAmJlxuICAgICAgKG9iamVjdFRvU3RyaW5nKGUpID09PSAnW29iamVjdCBFcnJvcl0nIHx8IGUgaW5zdGFuY2VvZiBFcnJvcik7XG59XG5leHBvcnRzLmlzRXJyb3IgPSBpc0Vycm9yO1xuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Z1bmN0aW9uJztcbn1cbmV4cG9ydHMuaXNGdW5jdGlvbiA9IGlzRnVuY3Rpb247XG5cbmZ1bmN0aW9uIGlzUHJpbWl0aXZlKGFyZykge1xuICByZXR1cm4gYXJnID09PSBudWxsIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnYm9vbGVhbicgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdudW1iZXInIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnc3RyaW5nJyB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ3N5bWJvbCcgfHwgIC8vIEVTNiBzeW1ib2xcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICd1bmRlZmluZWQnO1xufVxuZXhwb3J0cy5pc1ByaW1pdGl2ZSA9IGlzUHJpbWl0aXZlO1xuXG5leHBvcnRzLmlzQnVmZmVyID0gcmVxdWlyZSgnLi9zdXBwb3J0L2lzQnVmZmVyJyk7XG5cbmZ1bmN0aW9uIG9iamVjdFRvU3RyaW5nKG8pIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvKTtcbn1cblxuXG5mdW5jdGlvbiBwYWQobikge1xuICByZXR1cm4gbiA8IDEwID8gJzAnICsgbi50b1N0cmluZygxMCkgOiBuLnRvU3RyaW5nKDEwKTtcbn1cblxuXG52YXIgbW9udGhzID0gWydKYW4nLCAnRmViJywgJ01hcicsICdBcHInLCAnTWF5JywgJ0p1bicsICdKdWwnLCAnQXVnJywgJ1NlcCcsXG4gICAgICAgICAgICAgICdPY3QnLCAnTm92JywgJ0RlYyddO1xuXG4vLyAyNiBGZWIgMTY6MTk6MzRcbmZ1bmN0aW9uIHRpbWVzdGFtcCgpIHtcbiAgdmFyIGQgPSBuZXcgRGF0ZSgpO1xuICB2YXIgdGltZSA9IFtwYWQoZC5nZXRIb3VycygpKSxcbiAgICAgICAgICAgICAgcGFkKGQuZ2V0TWludXRlcygpKSxcbiAgICAgICAgICAgICAgcGFkKGQuZ2V0U2Vjb25kcygpKV0uam9pbignOicpO1xuICByZXR1cm4gW2QuZ2V0RGF0ZSgpLCBtb250aHNbZC5nZXRNb250aCgpXSwgdGltZV0uam9pbignICcpO1xufVxuXG5cbi8vIGxvZyBpcyBqdXN0IGEgdGhpbiB3cmFwcGVyIHRvIGNvbnNvbGUubG9nIHRoYXQgcHJlcGVuZHMgYSB0aW1lc3RhbXBcbmV4cG9ydHMubG9nID0gZnVuY3Rpb24oKSB7XG4gIGNvbnNvbGUubG9nKCclcyAtICVzJywgdGltZXN0YW1wKCksIGV4cG9ydHMuZm9ybWF0LmFwcGx5KGV4cG9ydHMsIGFyZ3VtZW50cykpO1xufTtcblxuXG4vKipcbiAqIEluaGVyaXQgdGhlIHByb3RvdHlwZSBtZXRob2RzIGZyb20gb25lIGNvbnN0cnVjdG9yIGludG8gYW5vdGhlci5cbiAqXG4gKiBUaGUgRnVuY3Rpb24ucHJvdG90eXBlLmluaGVyaXRzIGZyb20gbGFuZy5qcyByZXdyaXR0ZW4gYXMgYSBzdGFuZGFsb25lXG4gKiBmdW5jdGlvbiAobm90IG9uIEZ1bmN0aW9uLnByb3RvdHlwZSkuIE5PVEU6IElmIHRoaXMgZmlsZSBpcyB0byBiZSBsb2FkZWRcbiAqIGR1cmluZyBib290c3RyYXBwaW5nIHRoaXMgZnVuY3Rpb24gbmVlZHMgdG8gYmUgcmV3cml0dGVuIHVzaW5nIHNvbWUgbmF0aXZlXG4gKiBmdW5jdGlvbnMgYXMgcHJvdG90eXBlIHNldHVwIHVzaW5nIG5vcm1hbCBKYXZhU2NyaXB0IGRvZXMgbm90IHdvcmsgYXNcbiAqIGV4cGVjdGVkIGR1cmluZyBib290c3RyYXBwaW5nIChzZWUgbWlycm9yLmpzIGluIHIxMTQ5MDMpLlxuICpcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGN0b3IgQ29uc3RydWN0b3IgZnVuY3Rpb24gd2hpY2ggbmVlZHMgdG8gaW5oZXJpdCB0aGVcbiAqICAgICBwcm90b3R5cGUuXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBzdXBlckN0b3IgQ29uc3RydWN0b3IgZnVuY3Rpb24gdG8gaW5oZXJpdCBwcm90b3R5cGUgZnJvbS5cbiAqL1xuZXhwb3J0cy5pbmhlcml0cyA9IHJlcXVpcmUoJ2luaGVyaXRzJyk7XG5cbmV4cG9ydHMuX2V4dGVuZCA9IGZ1bmN0aW9uKG9yaWdpbiwgYWRkKSB7XG4gIC8vIERvbid0IGRvIGFueXRoaW5nIGlmIGFkZCBpc24ndCBhbiBvYmplY3RcbiAgaWYgKCFhZGQgfHwgIWlzT2JqZWN0KGFkZCkpIHJldHVybiBvcmlnaW47XG5cbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhhZGQpO1xuICB2YXIgaSA9IGtleXMubGVuZ3RoO1xuICB3aGlsZSAoaS0tKSB7XG4gICAgb3JpZ2luW2tleXNbaV1dID0gYWRkW2tleXNbaV1dO1xuICB9XG4gIHJldHVybiBvcmlnaW47XG59O1xuXG5mdW5jdGlvbiBoYXNPd25Qcm9wZXJ0eShvYmosIHByb3ApIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApO1xufVxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvdXRpbC91dGlsLmpzXG4vLyBtb2R1bGUgaWQgPSAxM1xuLy8gbW9kdWxlIGNodW5rcyA9IDAgMSIsInZhciBnO1xyXG5cclxuLy8gVGhpcyB3b3JrcyBpbiBub24tc3RyaWN0IG1vZGVcclxuZyA9IChmdW5jdGlvbigpIHtcclxuXHRyZXR1cm4gdGhpcztcclxufSkoKTtcclxuXHJcbnRyeSB7XHJcblx0Ly8gVGhpcyB3b3JrcyBpZiBldmFsIGlzIGFsbG93ZWQgKHNlZSBDU1ApXHJcblx0ZyA9IGcgfHwgRnVuY3Rpb24oXCJyZXR1cm4gdGhpc1wiKSgpIHx8ICgxLGV2YWwpKFwidGhpc1wiKTtcclxufSBjYXRjaChlKSB7XHJcblx0Ly8gVGhpcyB3b3JrcyBpZiB0aGUgd2luZG93IHJlZmVyZW5jZSBpcyBhdmFpbGFibGVcclxuXHRpZih0eXBlb2Ygd2luZG93ID09PSBcIm9iamVjdFwiKVxyXG5cdFx0ZyA9IHdpbmRvdztcclxufVxyXG5cclxuLy8gZyBjYW4gc3RpbGwgYmUgdW5kZWZpbmVkLCBidXQgbm90aGluZyB0byBkbyBhYm91dCBpdC4uLlxyXG4vLyBXZSByZXR1cm4gdW5kZWZpbmVkLCBpbnN0ZWFkIG9mIG5vdGhpbmcgaGVyZSwgc28gaXQnc1xyXG4vLyBlYXNpZXIgdG8gaGFuZGxlIHRoaXMgY2FzZS4gaWYoIWdsb2JhbCkgeyAuLi59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGc7XHJcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vICh3ZWJwYWNrKS9idWlsZGluL2dsb2JhbC5qc1xuLy8gbW9kdWxlIGlkID0gMTRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIDEiLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxuLy8gY2FjaGVkIGZyb20gd2hhdGV2ZXIgZ2xvYmFsIGlzIHByZXNlbnQgc28gdGhhdCB0ZXN0IHJ1bm5lcnMgdGhhdCBzdHViIGl0XG4vLyBkb24ndCBicmVhayB0aGluZ3MuICBCdXQgd2UgbmVlZCB0byB3cmFwIGl0IGluIGEgdHJ5IGNhdGNoIGluIGNhc2UgaXQgaXNcbi8vIHdyYXBwZWQgaW4gc3RyaWN0IG1vZGUgY29kZSB3aGljaCBkb2Vzbid0IGRlZmluZSBhbnkgZ2xvYmFscy4gIEl0J3MgaW5zaWRlIGFcbi8vIGZ1bmN0aW9uIGJlY2F1c2UgdHJ5L2NhdGNoZXMgZGVvcHRpbWl6ZSBpbiBjZXJ0YWluIGVuZ2luZXMuXG5cbnZhciBjYWNoZWRTZXRUaW1lb3V0O1xudmFyIGNhY2hlZENsZWFyVGltZW91dDtcblxuZnVuY3Rpb24gZGVmYXVsdFNldFRpbW91dCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NldFRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbmZ1bmN0aW9uIGRlZmF1bHRDbGVhclRpbWVvdXQgKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignY2xlYXJUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG4oZnVuY3Rpb24gKCkge1xuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc2V0VGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2YgY2xlYXJUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgIH1cbn0gKCkpXG5mdW5jdGlvbiBydW5UaW1lb3V0KGZ1bikge1xuICAgIGlmIChjYWNoZWRTZXRUaW1lb3V0ID09PSBzZXRUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICAvLyBpZiBzZXRUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkU2V0VGltZW91dCA9PT0gZGVmYXVsdFNldFRpbW91dCB8fCAhY2FjaGVkU2V0VGltZW91dCkgJiYgc2V0VGltZW91dCkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dChmdW4sIDApO1xuICAgIH0gY2F0Y2goZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwobnVsbCwgZnVuLCAwKTtcbiAgICAgICAgfSBjYXRjaChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yXG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKHRoaXMsIGZ1biwgMCk7XG4gICAgICAgIH1cbiAgICB9XG5cblxufVxuZnVuY3Rpb24gcnVuQ2xlYXJUaW1lb3V0KG1hcmtlcikge1xuICAgIGlmIChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGNsZWFyVGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICAvLyBpZiBjbGVhclRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGRlZmF1bHRDbGVhclRpbWVvdXQgfHwgIWNhY2hlZENsZWFyVGltZW91dCkgJiYgY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCAgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbChudWxsLCBtYXJrZXIpO1xuICAgICAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yLlxuICAgICAgICAgICAgLy8gU29tZSB2ZXJzaW9ucyBvZiBJLkUuIGhhdmUgZGlmZmVyZW50IHJ1bGVzIGZvciBjbGVhclRpbWVvdXQgdnMgc2V0VGltZW91dFxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKHRoaXMsIG1hcmtlcik7XG4gICAgICAgIH1cbiAgICB9XG5cblxuXG59XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xudmFyIGN1cnJlbnRRdWV1ZTtcbnZhciBxdWV1ZUluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIGNsZWFuVXBOZXh0VGljaygpIHtcbiAgICBpZiAoIWRyYWluaW5nIHx8ICFjdXJyZW50UXVldWUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHF1ZXVlID0gY3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIGRyYWluUXVldWUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVvdXQgPSBydW5UaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHdoaWxlICgrK3F1ZXVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50UXVldWUpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50UXVldWVbcXVldWVJbmRleF0ucnVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGN1cnJlbnRRdWV1ZSA9IG51bGw7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBydW5DbGVhclRpbWVvdXQodGltZW91dCk7XG59XG5cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcXVldWUucHVzaChuZXcgSXRlbShmdW4sIGFyZ3MpKTtcbiAgICBpZiAocXVldWUubGVuZ3RoID09PSAxICYmICFkcmFpbmluZykge1xuICAgICAgICBydW5UaW1lb3V0KGRyYWluUXVldWUpO1xuICAgIH1cbn07XG5cbi8vIHY4IGxpa2VzIHByZWRpY3RpYmxlIG9iamVjdHNcbmZ1bmN0aW9uIEl0ZW0oZnVuLCBhcnJheSkge1xuICAgIHRoaXMuZnVuID0gZnVuO1xuICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbn1cbkl0ZW0ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmZ1bi5hcHBseShudWxsLCB0aGlzLmFycmF5KTtcbn07XG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5wcm9jZXNzLnByZXBlbmRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnByZXBlbmRPbmNlTGlzdGVuZXIgPSBub29wO1xuXG5wcm9jZXNzLmxpc3RlbmVycyA9IGZ1bmN0aW9uIChuYW1lKSB7IHJldHVybiBbXSB9XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzXG4vLyBtb2R1bGUgaWQgPSAxNVxuLy8gbW9kdWxlIGNodW5rcyA9IDAgMSIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNCdWZmZXIoYXJnKSB7XG4gIHJldHVybiBhcmcgJiYgdHlwZW9mIGFyZyA9PT0gJ29iamVjdCdcbiAgICAmJiB0eXBlb2YgYXJnLmNvcHkgPT09ICdmdW5jdGlvbidcbiAgICAmJiB0eXBlb2YgYXJnLmZpbGwgPT09ICdmdW5jdGlvbidcbiAgICAmJiB0eXBlb2YgYXJnLnJlYWRVSW50OCA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy91dGlsL3N1cHBvcnQvaXNCdWZmZXJCcm93c2VyLmpzXG4vLyBtb2R1bGUgaWQgPSAxNlxuLy8gbW9kdWxlIGNodW5rcyA9IDAgMSIsImlmICh0eXBlb2YgT2JqZWN0LmNyZWF0ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAvLyBpbXBsZW1lbnRhdGlvbiBmcm9tIHN0YW5kYXJkIG5vZGUuanMgJ3V0aWwnIG1vZHVsZVxuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGluaGVyaXRzKGN0b3IsIHN1cGVyQ3Rvcikge1xuICAgIGN0b3Iuc3VwZXJfID0gc3VwZXJDdG9yXG4gICAgY3Rvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ3Rvci5wcm90b3R5cGUsIHtcbiAgICAgIGNvbnN0cnVjdG9yOiB7XG4gICAgICAgIHZhbHVlOiBjdG9yLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgfVxuICAgIH0pO1xuICB9O1xufSBlbHNlIHtcbiAgLy8gb2xkIHNjaG9vbCBzaGltIGZvciBvbGQgYnJvd3NlcnNcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbmhlcml0cyhjdG9yLCBzdXBlckN0b3IpIHtcbiAgICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvclxuICAgIHZhciBUZW1wQ3RvciA9IGZ1bmN0aW9uICgpIHt9XG4gICAgVGVtcEN0b3IucHJvdG90eXBlID0gc3VwZXJDdG9yLnByb3RvdHlwZVxuICAgIGN0b3IucHJvdG90eXBlID0gbmV3IFRlbXBDdG9yKClcbiAgICBjdG9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGN0b3JcbiAgfVxufVxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvaW5oZXJpdHMvaW5oZXJpdHNfYnJvd3Nlci5qc1xuLy8gbW9kdWxlIGlkID0gMTdcbi8vIG1vZHVsZSBjaHVua3MgPSAwIDEiLCJcclxudmFyIGRvd25FdmVudE5hbWUgPSAna2V5ZG93bic7XHJcbnZhciB1cEV2ZW50TmFtZSA9ICdrZXl1cCc7XHJcblxyXG5jbGFzcyBLZXlTdHJva2VIYW5kbGVyIHtcclxuICBjb25zdHJ1Y3RvciAoZWxlbWVudCwgc3RhdGUsIGJ1ZmZlcikge1xyXG4gICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcclxuICAgIHRoaXMuc3RhdGUgPSBzdGF0ZTtcclxuICAgIHRoaXMuYnVmZmVyID0gYnVmZmVyO1xyXG5cclxuICAgIHRoaXMuZG93bkhhbmRsZXIgPSB0aGlzLmRvd25IYW5kbGVyLmJpbmQodGhpcyk7XHJcbiAgICB0aGlzLnVwSGFuZGxlciA9IHRoaXMudXBIYW5kbGVyLmJpbmQodGhpcyk7XHJcbiAgfVxyXG5cclxuICBkb3duSGFuZGxlciAoZXZlbnQpIHtcclxuICAgIHZhciBkVCA9IHRoaXMuc3RhdGUuZ2V0RFQoZXZlbnQsIDIwKTtcclxuICAgIHRoaXMuYnVmZmVyLnB1c2goWzIsIGRULCAxLCBldmVudC5rZXlDb2RlXSwgWzQsIDIwLCAxLCA1XSk7XHJcbiAgfVxyXG5cclxuICB1cEhhbmRsZXIgKGV2ZW50KSB7XHJcbiAgICB2YXIgZFQgPSB0aGlzLnN0YXRlLmdldERUKGV2ZW50LCAyMCk7XHJcblxyXG4gICAgdGhpcy5idWZmZXIucHVzaChbMiwgZFQsIDAsIGV2ZW50LmtleUNvZGVdLCBbNCwgMjAsIDEsIDVdKTtcclxuICB9XHJcblxyXG4gIHN0YXJ0ICgpIHtcclxuICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGRvd25FdmVudE5hbWUsIHRoaXMuZG93bkhhbmRsZXIpO1xyXG4gICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIodXBFdmVudE5hbWUsIHRoaXMudXBIYW5kbGVyKTtcclxuICB9O1xyXG5cclxuICBzdG9wICgpIHtcclxuICAgIHRoaXMuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGRvd25FdmVudE5hbWUsIHRoaXMuZG93bkhhbmRsZXIpO1xyXG4gICAgdGhpcy5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIodXBFdmVudE5hbWUsIHRoaXMudXBIYW5kbGVyKTtcclxuICB9O1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBLZXlTdHJva2VIYW5kbGVyO1xyXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMva2V5U3Ryb2tlSGFuZGxlci5qcyIsImltcG9ydCBDSVRyYXAgZnJvbSAnLi8uLi9zcmMvaW5kZXgnO1xyXG5cclxudmFyIGNpVHJhcCA9IG5ldyBDSVRyYXAoKTtcclxuXHJcbndpbmRvdy5vbmxvYWQgPSAoKSA9PiB7XHJcbiAgdmFyIHN0YXJ0QnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N0YXJ0Jyk7XHJcbiAgdmFyIHN0b3BCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3RvcCcpO1xyXG4gIHZhciBzaG93QnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Nob3cnKTtcclxuICB2YXIgYnVmZmVyRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J1ZmZlcicpO1xyXG5cclxuICBzdGFydEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgIGNpVHJhcC5zdGFydCgpO1xyXG4gIH0pO1xyXG5cclxuICBzdG9wQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgY2lUcmFwLnN0b3AoKTtcclxuICB9KTtcclxuXHJcbiAgc2hvd0J1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgIGJ1ZmZlckRpdi5pbm5lckhUTUwgPSBjaVRyYXAuYnVmZmVyKCk7XHJcbiAgfSk7XHJcbn07XHJcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL2V4YW1wbGUvYXBwLmpzIl0sInNvdXJjZVJvb3QiOiIifQ==