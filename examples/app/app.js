/* global window document require */

(function(global, window, document, require) {
"use strict";
// ---------------------------------------------------------------------------

// Mini-apps demonstrating AlgernonTrap's functions.

var algernonTrap = require("../../src/algernon-trap");

// Example 0 -- export AlgernonTrap to play around.
window.AT = algernonTrap;
// end of Example 0

// Example 1 -- start-stop-send buttons
var windowAT = algernonTrap();

var ex1StartButton        = document.getElementById("ex1-start"),
  ex1StopButton           = document.getElementById("ex1-stop"),
  ex1ShowBufferButton     = document.getElementById("ex1-show-buffer"),
  ex1ShowRawBufferButton  = document.getElementById("ex1-show-raw-buffer"),
  ex1SendButton           = document.getElementById("ex1-send"),

  stateSpan               = document.getElementById("window-state");

ex1StartButton.addEventListener("click", function(event) {
  event.preventDefault();
  windowAT.start();
  // Remove this when DOM-events are available in AlgernonTrap
  stateSpan.innerHTML = "processing";
});

ex1StopButton.addEventListener("click", function(event) {
  event.preventDefault();
  windowAT.stop();
  // Remove this when DOM-events are available in AlgernonTrap
  stateSpan.innerHTML = "stopped";
});

ex1ShowBufferButton.addEventListener("click", function(event) {
  event.preventDefault();
  var pre = document.getElementById("window-buffer");
  pre.innerHTML = windowAT.buffer();
});

ex1ShowRawBufferButton.addEventListener("click", function(event) {
  event.preventDefault();
  var pre  = document.getElementById("window-buffer"),
    buffer = windowAT.rawBuffer(),
    length = buffer.length,
    result = "",
    i = 0;
  for ( ; i < length; i++ ) {
    result += "[" + buffer[i] + "] ";
  }
  pre.innerHTML = result;
});

ex1SendButton.addEventListener("click", function(event) {
  event.preventDefault();
  windowAT.send(function() {stateSpan.innerHTML = "sent";});
});

// end of Example 1

// ---------------------------------------------------------------------------
})(this, window, document, require);

// var timer;
// startSender = function() {
//   timer = setTimeout(function () {
//             windowAT.sendAndReset({"motion-data": windowAT.buffer()});
//             startSender();
//           } ,1000);
// };
// stopSender = function() {
//   clearTimeout(timer);
// }
//
// window.onunload = function() {
//   windowAT.stop();
//   windowAT.sendAndReset({"motion-data": windowAT.buffer()});
// };
