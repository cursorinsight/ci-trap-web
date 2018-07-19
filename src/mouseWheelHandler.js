var
  eventName = "wheel";

class MouseWheelHandler {
  constructor(element, state, buffer) {
    this.element = element,
      this.state = state,
      this.buffer = buffer;

      this.handler = this.handler.bind(this);
  }
  // ---------------------------------------------------------------------------


  handler(event) {
    var
      dT = this.state.getDT(event, 20);

    // console.log("wheeling", event);
  };

  start() {
    this.element.addEventListener(eventName, this.handler);
  };

  stop() {
    this.element.removeEventListener(eventName, this.handler);
  };

  // ---------------------------------------------------------------------------
};

export default MouseWheelHandler;
