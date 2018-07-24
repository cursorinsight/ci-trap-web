
var eventName = 'beforeunload';

class WindowUnloadHandler {
  constructor (window, state, buffer) {
    this.window = window;
    this.state = state;
    this.buffer = buffer;

    this.handler = this.handler.bind(this);
  }

  handler (event) {
    var dT = this.state.getDT(event, 20);

    // 0b1001
    this.buffer.push([12, dT],
      [4, 20]);
  };

  start () {
    this.window.addEventListener(eventName, this.handler, false);
  };

  stop () {
    this.window.removeEventListener(eventName, this.handler, false);
  };
};

export default WindowUnloadHandler;
