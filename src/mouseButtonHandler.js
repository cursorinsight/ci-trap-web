var downEventName = 'mousedown';
var upEventName = 'mouseup';

class MouseButtonHandler {
  constructor (element, state, buffer) {
    this.element = element;
    this.state = state;
    this.buffer = buffer;

    this.downHandler = this.downHandler.bind(this);
    this.upHandler = this.upHandler.bind(this);
  }

  button (event) {
    var bb = event.which || (
      function (b) {
        if (b === 4) {
          return 2;
        } else if (b === 2) {
          return 3;
        } else {
          return 1;
        }
      }(event.button));
    return bb;
  }

  downHandler (event) {
    var dT = this.state.getDT(event, 20);
    var sX = event.screenX;
    var sY = event.screenY;
    this.buffer.push([2, dT, sX, sY, 0, this.button(event)], [4, 20, 18, 18, 1, 5]);
  }

  upHandler (event) {
    var dT = this.state.getDT(event, 20);
    var sX = event.screenX;
    var sY = event.screenY;
    this.buffer.push([2, dT, sX, sY, 0, this.button(event)], [4, 20, 18, 18, 1, 5]);
  }

  start () {
    this.element.addEventListener(downEventName, this.downHandler);
    this.element.addEventListener(upEventName, this.upHandler);
  };

  stop () {
    this.element.removeEventListener(downEventName, this.downHandler);
    this.element.removeEventListener(upEventName, this.upHandler);
  };
}

export default MouseButtonHandler;
