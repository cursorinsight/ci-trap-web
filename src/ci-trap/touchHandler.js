/* global module */

// TODO: save touchScreenX/Y values into state
// TODO: simplify / group start/end/move handlers, they are nearly identical
var
  startEventName = "touchstart",
  endEventName = "touchend",
  moveEventName = "touchmove",

  touchIdToId = [];

class TouchHandler {
  constructor(element, state, buffer) {
    this.element = element,
      this.state = state,
      this.buffer = buffer;

      this.startHandler = this.startHandler.bind(this);
      this.moveHandler = this.moveHandler.bind(this);
      this.endHandler = this.endHandler.bind(this);
  }
  // ---------------------------------------------------------------------------



  // finds an existing (or free) id for given touchId, starting from 0.
  resolveId(touchId) {
    var
      firstFree,
      length = touchIdToId.length,
      i = 0;
    for (; i < length; i++) {
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
  };

  // removes touchId from list.
  removeId(touchId) {
    var length = touchIdToId.length, i = 0;
    for (; i < length; i++) {
      if (touchIdToId[i] === touchId) { touchIdToId[i] = undefined; }
    }
    i--;
    for (; i >= 0; i--) {
      if (touchIdToId[i] === undefined) {
        touchIdToId.pop();
      } else {
        break;
      }
    }
  };

  startHandler(event) {
    var
      dT = this.state.getDT(event, 20),
      changedTouches = event.changedTouches,
      length = changedTouches.length,
      i = 0;

    for (; i < length; i++) {
      var
        ev = changedTouches[i],
        id = resolveId(ev.identifier);
        this.buffer.push([3, dT, 1, id, ev.screenX, ev.screenY],
        [4, 20, 1, 5, 18, 18]);
      dT = 0; // next
    }

    return true;
  };

  endHandler(event) {
    var
      dT = this.state.getDT(event, 20),
      changedTouches = event.changedTouches,
      length = changedTouches.length,
      i = 0;

    for (; i < length; i++) {
      var
        ev = changedTouches[i],
        id = resolveId(ev.identifier);
        this.buffer.push([3, dT, 0, id, ev.screenX, ev.screenY],
        [4, 20, 1, 5, 18, 18]);

      removeId(ev.identifier);

      dT = 0; // next
    }

    return true;
  };

  moveHandler(event) {
    var
      dT = this.state.getDT(event, 20),
      changedTouches = event.changedTouches,
      length = changedTouches.length,
      i = 0;

    for (; i < length; i++) {
      var
        ev = changedTouches[i],
        id = resolveId(ev.identifier);
        this.buffer.push([1, dT, 0, id, ev.screenX, ev.screenY],
        [4, 20, 1, 5, 18, 18]);
      dT = 0; // next
    }

    return true;
  };

  start() {
    this.element.addEventListener(startEventName, this.startHandler);
    this.element.addEventListener(moveEventName, this.moveHandler);
    this.element.addEventListener(endEventName, this.endHandler);
  };

  stop() {
    this.element.removeEventListener(startEventName, this.startHandler);
    this.element.removeEventListener(moveEventName, this.moveHandler);
    this.element.removeEventListener(endEventName, this.endHandler);
  };

  // ---------------------------------------------------------------------------
};

export default TouchHandler;
