/* global window document require */

(function(global, window, document, require) {
"use strict";
// ---------------------------------------------------------------------------

// Mini-apps demonstrating AlgernonTrap's functions.

var AlgernonTrap = require("../../src/algernon-trap");

// Example 0 -- export AlgernonTrap to play around.
window.AlgernonTrap = AlgernonTrap;
// end of Example 0

// Example 1 -- start-stop-send buttons
var algernonTrap = new AlgernonTrap();
window.algernonTrap = algernonTrap;

var ex1StartButton        = document.getElementById("ex1-start"),
  ex1StopButton           = document.getElementById("ex1-stop"),
  ex1ShowBufferButton     = document.getElementById("ex1-show-buffer"),
  ex1MarkButton           = document.getElementById("ex1-mark"),
  ex1SendButton           = document.getElementById("ex1-send"),

  stateSpan               = document.getElementById("window-state");

ex1StartButton.addEventListener("click", function(event) {
  if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
  algernonTrap.start();
  // Remove this when DOM-events are available in AlgernonTrap
  stateSpan.innerHTML = "processing";
});

ex1StopButton.addEventListener("click", function(event) {
  if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
  algernonTrap.stop();
  // Remove this when DOM-events are available in AlgernonTrap
  stateSpan.innerHTML = "stopped";
});

ex1ShowBufferButton.addEventListener("click", function(event) {
  if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
  var pre = document.getElementById("window-buffer");
  pre.innerHTML = algernonTrap.buffer();
});

ex1MarkButton.addEventListener("click", function(event) {
  if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
  var markEvent = new window.Event("at:mark");
  if (algernonTrap.element) {
    algernonTrap.element.dispatchEvent(markEvent);
  }
  stateSpan.innerHTML = "sent";
});

ex1SendButton.addEventListener("click", function(event) {
  if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
  algernonTrap.send(false, function() {stateSpan.innerHTML = "sent";});
});

// end of Example 1

// ---------------------------------------------------------------------------
})(this, window, document, require);
