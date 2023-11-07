//------------------------------------------------------------------------------
// Copyright (C) 2023- Cursor Insight Ltd.
//
// All rights reserved.
//------------------------------------------------------------------------------
// Handler implementation to manage incoming DOM events.
//------------------------------------------------------------------------------

import simpleAutoBind from './simpleAutoBind';

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
} from './constants';

import TimeUtils from './timeUtils';

export default class Handlers {
  constructor(buffer) {
    simpleAutoBind(this);

    // Event buffer that receive messages
    this._buffer = buffer;

    // DOM elements to which these handlers are already mounted to
    this._registeredElements = [];
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
      element.addEventListener('touchstart', this.handleTouchStart);
      element.addEventListener('touchmove', this.handleTouchMove);
      element.addEventListener('touchend', this.handleTouchEnd);
    } else if (POINTER_ENABLED) {
      element.addEventListener('pointermove', this.handlePointerMove);
      element.addEventListener('pointerdown', this.handlePointerDown);
      element.addEventListener('pointerup', this.handlePointerUp);
    } else {
      element.addEventListener('mousemove', this.handlePointerMove);
      element.addEventListener('mousedown', this.handlePointerDown);
      element.addEventListener('mouseup', this.handlePointerUp);
    }

    element.addEventListener('wheel', this.handleWheel);

    // Insert `element` into `_registeredElements`
    this._registeredElements.push(element);
  }

  // Unmount handlers from given DOM element
  umount(element) {
    if (!this._registeredElements.includes(element)) { return; }

    if (TOUCH_ENABLED) {
      element.removeEventListener('touchstart', this.handleTouchStart);
      element.removeEventListener('touchmove', this.handleTouchMove);
      element.removeEventListener('touchend', this.handleTouchEnd);
    } else if (POINTER_ENABLED) {
      element.removeEventListener('pointermove', this.handlePointerMove);
      element.removeEventListener('pointerdown', this.handlePointerDown);
      element.removeEventListener('pointerup', this.handlePointerUp);
    } else {
      element.removeEventListener('mousemove', this.handlePointerMove);
      element.removeEventListener('mousedown', this.handlePointerDown);
      element.removeEventListener('mouseup', this.handlePointerUp);
    }

    element.removeEventListener('wheel', this.handleWheel);

    // Remove `element` from `_registeredElements`
    const idx = this._registeredElements.indexOf(element);
    this._registeredElements.splice(idx, 1);

    // Last, unregister global handlers
    this.umountGlobal();
  }

  // Push event to the buffer
  push(...props) {
    this._buffer.push(...props);
  }

  // Submit events explicitly
  submit() {
    this._buffer.submit();
  }

  // `pointermove` and `mousemove` event handler
  handlePointerMove(event) {
    this.push(
      MOUSE_MOVE_MESSAGE_TYPE,
      TimeUtils.convertEventTimeToTs(event.timeStamp),
      event.screenX,
      event.screenY,
      event.buttons,
    );
  }

  // `pointerdown` and `mousedown` event handler
  handlePointerDown(event) {
    this.push(
      MOUSE_DOWN_MESSAGE_TYPE,
      TimeUtils.convertEventTimeToTs(event.timeStamp),
      event.screenX,
      event.screenY,
      event.buttons,
      event.button,
    );
  }

  // `pointerup` and `mouseup` event handler
  handlePointerUp(event) {
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
      this.submit();
    }
  }

  // Handle "page unload" events the safe way -- that is compatible with
  // browsers that does not support `visibilitychange` events.
  //
  // For more info, see: `handleVisibilityChange` too.
  handlePageHide(/* event */) {
    this.submit();
  }

  // Handle document freeze event
  handleFreeze(/* event */) {
    this.submit();
  }

  // Handle window focus leave event: register event and send stream
  // automatically.
  handleBlur(event) {
    this.push(BLUR_WINDOW_MESSAGE_TYPE, event);
    this.submit();
  }

  // Handle window focus event: register a new event to the stream
  handleFocus(event) {
    this.push(FOCUS_WINDOW_MESSAGE_TYPE, event);
  }
}
