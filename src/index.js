// ! ci-trap v0.2.0 - MIT license
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

import State from './state.js';
import StateHandler from './statehandler.js';
import TouchHandler from './touchHandler.js';
import MarkerHandler from './markerHandler.js';
import MouseMoveHandler from './mouseMoveHandler.js';
import MouseButtonHandler from './mouseButtonHandler.js';
import PageScrollHandler from './pageScrollHandler.js';
import WindowSizeHandler from './windowSizeHandler.js';
import WindowPositionHandler from './windowPositionHandler.js';
import WindowUnloadHandler from './windowUnloadHandler.js';
import VisibilityChangeHandler from './visibilityChangeHandler.js';
//  import  MouseWheelHandler = from './mouseWheelHandler.js'

import Transport from './transport.js';
import isNullOrUndefined from 'util';
import KeyStrokeHandler from './keyStrokeHandler.js';

class CITrap {
  constructor (element = window.document, idleTimeout = 0) {
    var windowAlias = window;
    var documentAlias = window.document;
    var undefinedAlias;

    var windowSupport = (element === windowAlias || element === documentAlias);
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
    this.transport = new Transport(windowAlias);

    // State
    this.state = new State(windowAlias, this.transport, idleTimeout);

    // Handlers
    this.handlers = new Array(this.state);

    this.markerHandler = new MarkerHandler(windowAlias, documentAlias, element, this.state, this.transport);

    this.handlers.push(new StateHandler(windowAlias, documentAlias, element, this.state, this.transport));
    this.handlers.push(this.markerHandler);
    this.handlers.push(new MouseMoveHandler(element, this.state, this.transport));
    this.handlers.push(new MouseButtonHandler(element, this.state, this.transport));
    this.handlers.push(new KeyStrokeHandler(element, this.state, this.transport));

    // IE 6, 7, 8 does not support scroll event on document
    // http://www.quirksmode.org/dom/events/scroll.html
    this.handlers.push(new PageScrollHandler(element === documentAlias ? windowAlias : element, this.state, this.transport));

    // handlers.push(new MouseWheelHandler.default.prototype.constructor(element, state, transport));

    if (windowSupport) {
      this.handlers.push(new WindowSizeHandler(windowAlias, this.state, this.transport));
      this.handlers.push(new WindowPositionHandler(windowAlias, documentAlias, this.state, this.transport));
      this.handlers.push(new WindowUnloadHandler(windowAlias, this.state, this.transport));
      this.handlers.push(new VisibilityChangeHandler(windowAlias, this.state, this.transport));
    }

    if (touchSupport) {
      this.handlers.push(new TouchHandler(element, this.state, this.transport));
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
  start (options) {
    if (this.running) {
      return;
    }
    options = options || {};
    var length = this.handlers.length;
    for (var i = 0; i < length; i++) {
      if ((this.handlers[i] !== isNullOrUndefined) && (typeof this.handlers[i].start === 'function')) {
        this.handlers[i].start(options);
      }
    }
    this.running = true;
  }

  /**
   *  Stops event processing.
   */
  stop () {
    if (!this.running) {
      return;
    }
    var length = this.handlers.length;
    for (var i = 0; i < length; i++) {
      if ((this.handlers[i] !== isNullOrUndefined) && (typeof this.handlers[i].stop === 'function')) {
        this.handlers[i].stop();
      }
    }
    this.running = false;
  }

  buffer () {
    return this.transport.getBuffer();
  }

  send () {
    return this.transport.send.apply(this, arguments);
  }

  setHeader () {
    return this.transport.setHeader.apply(this, arguments);
  }

  setUrl () {
    return this.transport.setUrl.apply(this, arguments);
  }

  setSessionID () {
    return this.transport.setSessionID.apply(this, arguments);
  }

  mark (text) {
    if (this.markerHandler) {
      this.markerHandler.trigger(text);
    }
  }
};

/**
 * Expose CITrap
 */
export default CITrap;
