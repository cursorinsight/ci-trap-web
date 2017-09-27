/* global window document require */

(function(global, window, document, require) {
"use strict";
// ---------------------------------------------------------------------------

// Mini-apps demonstrating CITrap's functions.

var CITrap = require("../../src/ci-trap");

// Example 0 -- export CITrap to play around.
window.CITrap = CITrap;
// end of Example 0

// Example 1 -- start-stop-send buttons
var ciTrap = new CITrap();
window.ciTrap = ciTrap;

var ex1StartButton        = document.getElementById("ex1-start"),
  ex1StopButton           = document.getElementById("ex1-stop"),
  ex1ShowBufferButton     = document.getElementById("ex1-show-buffer"),
  ex1MarkButton           = document.getElementById("ex1-mark"),
  ex1DebugButton          = document.getElementById("ex1-debug"),
  ex1SendButton           = document.getElementById("ex1-send"),

  stateSpan               = document.getElementById("window-state");

ex1StartButton.addEventListener("click", function(event) {
  if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
  ciTrap.start();
  // Remove this when DOM-events are available in CITrap
  stateSpan.innerHTML = "processing";
});

ex1StopButton.addEventListener("click", function(event) {
  if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
  ciTrap.stop();
  // Remove this when DOM-events are available in CITrap
  stateSpan.innerHTML = "stopped";
});

ex1ShowBufferButton.addEventListener("click", function(event) {
  if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
  var pre = document.getElementById("window-buffer");
  pre.innerHTML = ciTrap.buffer();
});

ex1MarkButton.addEventListener("click", function(event) {
  if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
  var markEvent = new window.Event("ct:mark"),
    markInput = document.getElementById("ex1-mark-input"),
    text = markInput.value;
  if (text) { markEvent.text = text; }
  if (ciTrap.element) {
    ciTrap.element.dispatchEvent(markEvent);
  }
  stateSpan.innerHTML = "sent";
});

ex1DebugButton.addEventListener("click", function(event) {
  if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
  var debugEvent = new window.Event("ct:debug");
  if (ciTrap.element) {
    ciTrap.element.dispatchEvent(debugEvent);
  }
  stateSpan.innerHTML = "sent";
});

ex1SendButton.addEventListener("click", function(event) {
  if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
  ciTrap.send(false, function() {stateSpan.innerHTML = "sent";});
});

// end of Example 1

// ---------------------------------------------------------------------------
})(this, window, document, require);
