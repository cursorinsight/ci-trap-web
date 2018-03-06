var
  abs = Math.abs,
  eventName = "scroll";

// TODO simplify/check this handler

class PageScrollHandler {
  constructor(element, state, buffer) {
    this.element = element,
      this.state = state,
      this.buffer = buffer;

      this.handler = this.handler.bind(this);
  }
  // ---------------------------------------------------------------------------

  handler(event) {

    var
      pX, pY,
      dX, dY,
      signDX, signDY,
      absDX, absDY,

      dT = this.state.getDT(event, 20);

    // Scroll X/Y on current page
    if ("pageXOffset" in this.element && this.element.document) { // it's a window, or looks like a window
      var doc = this.element.document.documentElement;
      pX = (this.element.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
      pY = (this.element.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);
    } else { // fallback
      pX = event.pageX;
      pY = event.pageY;
    }

    dX = pX - this.state.pX;
    signDX = dX < 0 ? 1 : 0;
    absDX = abs(dX);
    dY = pY - this.state.pY;
    signDY = dY < 0 ? 1 : 0;
    absDY = abs(dY);

    this.state.pageScrollX = pX;
    this.state.pageScrollY = pY;

    this.buffer.push([4, dT, signDX, absDX, signDY, absDY],
      [4, 20, 1, 11, 1, 11]);

    return true;
  };

  start() {

    // Scroll X/Y on current page
    if ("pageXOffset" in this.element && this.element.document) { // it's a window, or looks like a window
      var doc = this.element.document.documentElement;
      this.state.pageScrollX = (this.element.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
      this.state.pageScrollY = (this.element.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);
    } else { // fallback
      this.state.pageScrollX = 0;
      this.state.pageScrollY = 0;
    }

    this.element.addEventListener(eventName, this.handler, false);
  };

  stop() {
    this.element.removeEventListener(eventName, this.handler, false);
  };

  // ---------------------------------------------------------------------------
};

export default PageScrollHandler;
