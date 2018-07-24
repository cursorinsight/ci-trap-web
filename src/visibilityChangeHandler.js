var stateKey;
var eventKey;

var keys = {
  hidden: 'visibilitychange',
  webkitHidden: 'webkitvisibilitychange',
  mozHidden: 'mozvisibilitychange',
  msHidden: 'msvisibilitychange'
};

class VisibilityChangeHandler {
  constructor (window, state, buffer) {
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

  handler (event) {
    var dT = this.state.getDT(event, 20);

    if (this.window.document[stateKey]) { // idle/hidden, 0b1011
      this.buffer.push([11, dT],
        [4, 20]);
    } else { // focused/visible, 0b1010
      this.buffer.push([10, dT],
        [4, 20]);
    }
  };

  start () {
    window.addEventListener(eventKey, this.handler, false);
  };

  stop () {
    window.removeEventListener(eventKey, this.handler, false);
  };
};

export default VisibilityChangeHandler;
