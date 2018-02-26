/* global module */

var
  /*
   * State event name (constant).
   */
  eventName = "ct:state";

class StateHandler {
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
   * State event handler.
   */
  handler(event) {
    var
      dT = this.state.getDT(event, 20);

    this.buffer.push([15, dT, this.state.lastTs(),                      // 0b1111 <time-difference:20b> <current-time-stamp:42b>
      this.state.mouseScreenX, this.state.mouseScreenY,      // <mouse-screen-x:18b> <mouse-screen-y:18b>
      //state.cX, state.cY,                          // <mouse-client-x:18b> <mouse-client-y:18b>
      this.state.pageScrollX, this.state.pageScrollY,        // <page-scroll-x(left):18b> <page-scroll-y(top):18b>
      this.window.innerWidth, this.window.innerHeight,       // <inner-window-width:18b> <inner-window-height:18b>
      this.window.outerWidth, this.window.outerHeight,       // <outer-window-width:18b> <outer-window-height:18b>
      this.window.screenX || this.window.screenLeft,         // <window-position-left:18b>
      this.window.screenY || this.window.screenTop,          // <window-position-top:18b>
      this.window.screen.width, this.window.screen.height    // <screen-width:18b> <screen-height:18b>
    ],
      [4, 20, 42,
        18, 18, // 18, 18,
        18, 18, 18, 18,
        18, 18, 18, 18,
        18, 18]);
  };

  trigger() {
    var stateEvent = this.document.createEvent("CustomEvent");
    stateEvent.initEvent(eventName, true, false);
    this.element.dispatchEvent(stateEvent);
  };

  start(options) {
    this.element.addEventListener(eventName, this.handler, false);
    if (options.initialState === true) {
      trigger();
    }
  };

  stop() {
    this.element.removeEventListener(eventName, this.handler);
  };

  // ---------------------------------------------------------------------------
};

export default StateHandler;
