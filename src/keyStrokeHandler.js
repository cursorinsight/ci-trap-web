
var
  downEventName = "keydown",
  upEventName = "keyup";

class KeyStrokeHandler {
  constructor(element, state, buffer) {
    this.element = element,
      this.state = state,
      this.buffer = buffer;

      this.downHandler = this.downHandler.bind(this);
      this.upHandler = this.upHandler.bind(this);
      
  }

  downHandler(event) {
    var dT = this.state.getDT(event, 20);
    this.buffer.push([2, dT, 1, event.keyCode], [4, 20, 1, 5]);
  }

  upHandler(event) {
    var dT = this.state.getDT(event, 20);

    this.buffer.push([2, dT, 0, event.keyCode], [4, 20, 1, 5]);
  }

  start() {
    this.element.addEventListener(downEventName, this.downHandler);
    this.element.addEventListener(upEventName, this.upHandler);
  };

  stop() {
    this.element.removeEventListener(downEventName, this.downHandler);
    this.element.removeEventListener(upEventName, this.upHandler);
  };

}

export default KeyStrokeHandler;