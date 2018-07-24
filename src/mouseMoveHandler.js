var
  // abs = Math.abs,
  eventName = 'mousemove';

// TODO: http://www.jacklmoore.com/notes/mouse-position/

class MouseMoveHandler {
  constructor (element, state, buffer) {
    this.element = element;
    this.state = state;
    this.buffer = buffer;

    this.handler = this.handler.bind(this);
  }

  handler (event) {
    var dT = this.state.getDT(event, 20);
    var sX = event.screenX;
    var sY = event.screenY;

    // Saving for next check
    this.state.mouseScreenX = sX;
    this.state.mouseScreenY = sY;

    this.buffer.push([0, dT, sX, sY],
      [4, 20, 18, 18]);

    // Saving for markers -- temporarily disabled
    // state.cX = event.clientX;
    // state.cY = event.clientY;
    // buffer.push([0, dT, sX, sY, event.clientX, event.clientY],
    //             [4, 20, 18, 18,            18,            18]);

    return true;
  };

  start () {
    // TODO: Something more accurate is needed.
    this.state.mouseScreenX = this.state.mouseScreenX || 0;
    this.state.mouseScreenY = this.state.mouseScreenY || 0;

    this.element.addEventListener(eventName, this.handler);
  };

  stop () {
    this.element.removeEventListener(eventName, this.handler);
  };

  // ---------------------------------------------------------------------------
};

export default MouseMoveHandler;
