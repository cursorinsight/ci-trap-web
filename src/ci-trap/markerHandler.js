/* global module */
var
  eventName = "ct:mark",
  defaultText = "marker";

class MarkerHandler {
  constructor(window, document, element, state, buffer) {
    this.window = window,
      this.document = document,
      this.element = element,
      this.state = state,
      this.buffer = buffer;

      this.handler = this.handler.bind(this);
  }
  // ---------------------------------------------------------------------------

  /*
   * Marker event name (constant).
   */

  handler(event) {
    var
      dT = this.state.getDT(event, 20),
      text = event && event.text || defaultText;

    this.buffer.push([14, dT],
      [4, 20]);
    this.buffer.pushRawBytes(text);
  };

  trigger(text) {
    var markEvent = this.document.createEvent("CustomEvent");
    markEvent.initEvent(eventName, true, false);
    markEvent.text = text || "mark";
    this.element.dispatchEvent(markEvent);
  };

  start() {
    this.element.addEventListener(eventName, this.handler, false);
  };

  stop() {
    this.element.removeEventListener(eventName, this.handler);
  };

  // ---------------------------------------------------------------------------
}

export default MarkerHandler;
