//------------------------------------------------------------------------------
// Copyright (C) 2023- Cursor Insight Ltd.
//
// All rights reserved.
//------------------------------------------------------------------------------
// Manage disabling touch events when it is asked for.
//------------------------------------------------------------------------------

// Constants
import { TOUCH_ENABLED } from './constants';

const disableTouchEventMixin = {

  // Disable touch events, including panning and zooming
  disableTouchEvents(element) {
    if (TOUCH_ENABLED) {
      if (!element.dataset.oldTouchAction) {
        // eslint-disable-next-line no-param-reassign
        element.dataset.oldTouchAction = element.style.touchAction;
      }
      // eslint-disable-next-line no-param-reassign
      element.style.touchAction = 'none';
    }
  },

  // Restore original touch behaviour
  restoreTouchEvents(element) {
    if (TOUCH_ENABLED) {
      // eslint-disable-next-line no-param-reassign
      element.style.touchAction = element.dataset.oldTouchAction;
      // eslint-disable-next-line no-param-reassign
      delete element.dataset.oldTouchAction;
    }
  },
};

export default disableTouchEventMixin;
