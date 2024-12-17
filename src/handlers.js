//------------------------------------------------------------------------------
// Copyright (C) 2023- Cursor Insight Ltd.
//
// All rights reserved.
//------------------------------------------------------------------------------
// Handler implementation to manage incoming DOM events.
//------------------------------------------------------------------------------
import simpleAutoBind from './simpleAutoBind';
import eventEmitterMixin from './eventEmitterMixin';

import {
  TOUCH_ENABLED,
  POINTER_ENABLED,
  VISIBILITY_CHANGE_ENABLED,
  FREEZE_ENABLED,
  MOUSE_MOVE_MESSAGE_TYPE,
  TOUCH_START_MESSAGE_TYPE,
  TOUCH_MOVE_MESSAGE_TYPE,
  TOUCH_END_MESSAGE_TYPE,
  MOUSE_DOWN_MESSAGE_TYPE,
  MOUSE_UP_MESSAGE_TYPE,
  BLUR_WINDOW_MESSAGE_TYPE,
  FOCUS_WINDOW_MESSAGE_TYPE,
  WHEEL_MESSAGE_TYPE,
  SCROLL_MESSAGE_TYPE,
  REQUEST_ANIMATION_FRAME_MESSAGE_TYPE,
} from './constants';

import TimeUtils from './timeUtils';

const EVENT_HANDLER_OPTIONS = {
  passive: true,
  capture: true,
};

class Handlers {
  constructor() {
    simpleAutoBind(this);

    // DOM elements to which these handlers are already mounted to
    this._registeredElements = [];

    // Also capture coalesced events
    this._captureCoalescedEvents = true;

    this._requestAnimationFrameId = undefined;
  }

  // Mount global handlers -- that are not specific to any element.
  mountGlobal() {
    if (this._registeredElements.length > 0) { return; }

    if (VISIBILITY_CHANGE_ENABLED) {
      document.addEventListener(
        'visibilitychange',
        this.handleVisibilityChange,
      );
    } else {
      window.addEventListener('pagehide', this.handlePageHide);
    }

    if (FREEZE_ENABLED) {
      document.addEventListener('freeze', this.handleFreeze);
    }

    window.addEventListener('blur', this.handleBlur);
    window.addEventListener('focus', this.handleFocus);
    window.addEventListener('scroll', this.handleScroll);
  }

  // Unmount global handlers -- that are not specific to any element.
  umountGlobal() {
    if (this._registeredElements.length > 0) { return; }

    if (VISIBILITY_CHANGE_ENABLED) {
      document.removeEventListener(
        'visibilitychange',
        this.handleVisibilityChange,
      );
    } else {
      window.removeEventListener('pagehide', this.handlePageHide);
    }

    if (FREEZE_ENABLED) {
      document.removeEventListener('freeze', this.handleFreeze);
    }

    window.removeEventListener('blur', this.handleBlur);
    window.removeEventListener('focus', this.handleFocus);
    window.removeEventListener('scroll', this.handleScroll);
  }

  // Mount handlers to given DOM element
  mount(element) {
    if (this._registeredElements.includes(element)) { return; }

    // First register global handlers (e.g. `visibilitychange`)
    this.mountGlobal();

    if (TOUCH_ENABLED) {
      element.addEventListener(
        'touchstart',
        this.handleTouchStart,
        EVENT_HANDLER_OPTIONS,
      );
      element.addEventListener(
        'touchmove',
        this.handleTouchMove,
        EVENT_HANDLER_OPTIONS,
      );
      element.addEventListener(
        'touchend',
        this.handleTouchEnd,
        EVENT_HANDLER_OPTIONS,
      );
    } else if (POINTER_ENABLED) {
      element.addEventListener(
        'pointermove',
        this.handlePointerMove,
        EVENT_HANDLER_OPTIONS,
      );
      element.addEventListener(
        'pointerdown',
        this.handlePointerDown,
        EVENT_HANDLER_OPTIONS,
      );
      element.addEventListener(
        'pointerup',
        this.handlePointerUp,
        EVENT_HANDLER_OPTIONS,
      );
    } else {
      element.addEventListener(
        'mousemove',
        this.handleMouseMove,
        EVENT_HANDLER_OPTIONS,
      );
      element.addEventListener(
        'mousedown',
        this.handleMouseDown,
        EVENT_HANDLER_OPTIONS,
      );
      element.addEventListener(
        'mouseup',
        this.handleMouseUp,
        EVENT_HANDLER_OPTIONS,
      );
    }

    element.addEventListener('wheel', this.handleWheel, EVENT_HANDLER_OPTIONS);

    // Insert `element` into `_registeredElements`
    this._registeredElements.push(element);
  }

  // Unmount handlers from given DOM element
  umount(element) {
    if (!this._registeredElements.includes(element)) { return; }

    if (TOUCH_ENABLED) {
      element.removeEventListener(
        'touchstart',
        this.handleTouchStart,
        EVENT_HANDLER_OPTIONS,
      );
      element.removeEventListener(
        'touchmove',
        this.handleTouchMove,
        EVENT_HANDLER_OPTIONS,
      );
      element.removeEventListener(
        'touchend',
        this.handleTouchEnd,
        EVENT_HANDLER_OPTIONS,
      );
    } else if (POINTER_ENABLED) {
      element.removeEventListener(
        'pointermove',
        this.handlePointerMove,
        EVENT_HANDLER_OPTIONS,
      );
      element.removeEventListener(
        'pointerdown',
        this.handlePointerDown,
        EVENT_HANDLER_OPTIONS,
      );
      element.removeEventListener(
        'pointerup',
        this.handlePointerUp,
        EVENT_HANDLER_OPTIONS,
      );
    } else {
      element.removeEventListener(
        'mousemove',
        this.handleMouseMove,
        EVENT_HANDLER_OPTIONS,
      );
      element.removeEventListener(
        'mousedown',
        this.handleMouseDown,
        EVENT_HANDLER_OPTIONS,
      );
      element.removeEventListener(
        'mouseup',
        this.handleMouseUp,
        EVENT_HANDLER_OPTIONS,
      );
    }

    element.removeEventListener(
      'wheel',
      this.handleWheel,
      EVENT_HANDLER_OPTIONS,
    );

    // Remove `element` from `_registeredElements`
    const idx = this._registeredElements.indexOf(element);
    this._registeredElements.splice(idx, 1);

    // Last, unregister global handlers
    this.umountGlobal();
  }

  push(...props) {
    this.emit('message', props);
  }

  // Submit events explicitly
  requestSubmission() {
    this.emit('requestSubmission');
  }

  // Set the captureCoalescedEvents option
  captureCoalescedEvents(value) {
    this._captureCoalescedEvents = value;
  }

  // `pointermove` and `mousemove` event handler
  handlePointerMove(event) {
    let events = [];
    if (this._captureCoalescedEvents && event.getCoalescedEvents) {
      events = event.getCoalescedEvents();
    }

    if (events.length === 0) {
      this.handleSinglePointerMove(event, false);
    } else {
      events.forEach((coalescedEvent, index) => {
        this.handleSinglePointerMove(
          coalescedEvent,
          index !== events.length - 1,
        );
      });
    }
  }

  handleSinglePointerMove(event, coalesced) {
    switch (event.pointerType) {
      case 'mouse':
        this.handleMouseMove(event, coalesced);
        break;
      case 'touch':
        this.push(
          TOUCH_MOVE_MESSAGE_TYPE,
          TimeUtils.convertEventTimeToTs(event.timeStamp),
          event.pointerId,
          event.screenX,
          event.screenY,
          coalesced ? 1 : 0,
        );
        break;
      default:
        break;
    }
  }

  // `pointerdown` event handler
  handlePointerDown(event) {
    switch (event.pointerType) {
      case 'mouse':
        this.handleMouseDown(event);
        break;
      case 'touch':
        this.push(
          TOUCH_START_MESSAGE_TYPE,
          TimeUtils.convertEventTimeToTs(event.timeStamp),
          event.pointerId,
          event.screenX,
          event.screenY,
        );
        break;
      default:
        break;
    }
  }

  // `pointerup` and `mouseup` event handler
  handlePointerUp(event) {
    switch (event.pointerType) {
      case 'mouse':
        this.handleMouseUp(event);
        break;
      case 'touch':
        this.push(
          TOUCH_END_MESSAGE_TYPE,
          TimeUtils.convertEventTimeToTs(event.timeStamp),
          event.pointerId,
          event.screenX,
          event.screenY,
        );
        break;
      default:
        break;
    }
  }

  // `mousemove` event handler
  handleMouseMove(event, coalesced) {
    this.push(
      MOUSE_MOVE_MESSAGE_TYPE,
      TimeUtils.convertEventTimeToTs(event.timeStamp),
      event.screenX,
      event.screenY,
      event.buttons,
      coalesced ? 1 : 0,
    );
  }

  // `mousedown` event handler
  handleMouseDown(event) {
    this.push(
      MOUSE_DOWN_MESSAGE_TYPE,
      TimeUtils.convertEventTimeToTs(event.timeStamp),
      event.screenX,
      event.screenY,
      event.buttons,
      event.button,
    );
  }

  // `mouseup` event handler
  handleMouseUp(event) {
    this.push(
      MOUSE_UP_MESSAGE_TYPE,
      TimeUtils.convertEventTimeToTs(event.timeStamp),
      event.screenX,
      event.screenY,
      event.buttons,
      event.button,
    );
  }

  // `touchstart` event handler
  handleTouchStart(event) {
    this.iterateTouches(event, (touch) => {
      this.push(
        TOUCH_START_MESSAGE_TYPE,
        TimeUtils.convertEventTimeToTs(event.timeStamp),
        touch.identifier,
        touch.screenX,
        touch.screenY,
      );
    });
  }

  // `touchmove` event handler
  handleTouchMove(event) {
    this.iterateTouches(event, (touch) => {
      this.push(
        TOUCH_MOVE_MESSAGE_TYPE,
        TimeUtils.convertEventTimeToTs(event.timeStamp),
        touch.identifier,
        touch.screenX,
        touch.screenY,
        false,
      );
    });
  }

  // `touchend` event handler
  handleTouchEnd(event) {
    this.iterateTouches(event, (touch) => {
      this.push(
        TOUCH_END_MESSAGE_TYPE,
        TimeUtils.convertEventTimeToTs(event.timeStamp),
        touch.identifier,
        touch.screenX,
        touch.screenY,
      );
    });
  }

  // Touch helper
  // eslint-disable-next-line class-methods-use-this
  iterateTouches(event, fn) {
    Array.from(event.changedTouches).forEach(fn);
  }

  // Wheel event handler
  handleWheel(event) {
    this.push(
      WHEEL_MESSAGE_TYPE,
      TimeUtils.convertEventTimeToTs(event.timeStamp),
      event.deltaX,
      event.deltaY,
      event.deltaZ,
      event.deltaMode,
    );
  }

  // Scroll event handler
  handleScroll(event) {
    this.push(
      SCROLL_MESSAGE_TYPE,
      TimeUtils.convertEventTimeToTs(event.timeStamp),
      window.scrollX,
      window.scrollY,
    );
  }

  // Handle "page unload" events the recommended way.
  //
  // For details, see:
  // - https://caniuse.com/?search=visibilitychange
  // - https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilitychange_event
  // - https://developer.mozilla.org/en-US/docs/Web/API/Window/pagehide_event
  handleVisibilityChange(/* event */) {
    if (document.visibilityState === 'hidden') {
      this.requestSubmission();
    }
  }

  // Handle "page unload" events the safe way -- that is compatible with
  // browsers that does not support `visibilitychange` events.
  //
  // For more info, see: `handleVisibilityChange` too.
  handlePageHide(/* event */) {
    this.requestSubmission();
  }

  // Handle document freeze event
  handleFreeze(/* event */) {
    this.requestSubmission();
  }

  // Handle window focus leave event: register event and send stream
  // automatically.
  handleBlur(event) {
    this.push(
      BLUR_WINDOW_MESSAGE_TYPE,
      TimeUtils.convertEventTimeToTs(event.timeStamp),
      event,
    );
    this.requestSubmission();
  }

  // Handle window focus event: register a new event to the stream
  handleFocus(event) {
    this.push(
      FOCUS_WINDOW_MESSAGE_TYPE,
      TimeUtils.convertEventTimeToTs(event.timeStamp),
      event,
    );
  }

  // Start collecting requestAnimationFrame messages
  startRequestAnimationFrame() {
    this._requestAnimationFrameId = requestAnimationFrame(
      this.onRequestAnimationFrame,
    );
  }

  // Stop collecting requestAnimationFrame messages
  stopRequestAnimationFrame() {
    if (this._requestAnimationFrameId !== undefined) {
      cancelAnimationFrame(this._requestAnimationFrameId);
      this._requestAnimationFrameId = undefined;
    }
  }

  // Event handler for requestAnimationFrame
  onRequestAnimationFrame(timeStamp) {
    this._requestAnimationFrameId = requestAnimationFrame(
      this.onRequestAnimationFrame,
    );
    this.push(
      REQUEST_ANIMATION_FRAME_MESSAGE_TYPE,
      TimeUtils.convertEventTimeToTs(timeStamp),
    );
  }
}

Object.assign(Handlers.prototype, eventEmitterMixin);

export default Handlers;
