var eventName = 'positionchanged';
var longDelay = 1000 / 2; // 2fps
var shortDelay = 1000 / 15; // 15fps
var throttleBase = 15; // it's a "constant"
var throttleCount = throttleBase;
var timeout;

class WindowPositionHandler {
  constructor (window, document, state, buffer) {
    this.window = window;
    this.document = document;
    this.state = state;
    this.buffer = buffer;

    this.handler = this.handler.bind(this);
    this.poller = this.poller.bind(this);
  }

  windowPositionX () {
    return this.window.screenX || this.window.screenLeft || 0;
  };

  windowPositionY () {
    return this.window.screenY || this.window.screenTop || 0;
  };

  handler (event) {
    var dT = this.state.getDT(null, 20);

    this.state.windowPositionX = event.x;
    this.state.windowPositionY = event.y;

    // type = 0b1001
    this.buffer.push([9, dT, event.x, event.y],
      [4, 20, 15, 15]);
  };

  poller () {
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
  };

  startPoller () {
    this.window.setTimeout(this.poller, longDelay);
  };

  stopPoller () {
    if (timeout) {
      this.window.clearTimeout(timeout);
    }
  };

  start () {
    this.state.windowPositionX = this.windowPositionX();
    this.state.windowPositionY = this.windowPositionY();
    this.window.addEventListener(eventName, this.handler, false);
    this.startPoller();
  };

  stop () {
    this.stopPoller();
    this.window.removeEventListener(eventName, this.handler, false);
  };
};

export default WindowPositionHandler;
