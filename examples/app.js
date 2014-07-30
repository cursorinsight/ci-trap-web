// Mini-apps demonstrating AlgernonTrap's functions.

var algernonTrap = require("./algernon-trap.js");

// Example 0 -- export AlgernonTrap to play around.
window.AT = algernonTrap;
// end of Example 0

// Example 1 -- start-stop-send buttons

var body   = document.getElementsByTagName("body")[0];
var bodyAT = algernonTrap(body);

var ex1StartButton        = document.getElementById("ex1-start"),
  ex1StopButton           = document.getElementById("ex1-stop"),
  ex1ShowBufferButton     = document.getElementById("ex1-show-buffer"),
  ex1ShowRawBufferButton  = document.getElementById("ex1-show-raw-buffer"),
  ex1SendButton           = document.getElementById("ex1-send"),

  stateSpan               = document.getElementById("body-state");

var timer;
startSender = function() {
  timer = setTimeout(function () {
            bodyAT.sendAndReset({"motion-data": bodyAT.buffer()});
            startSender();
          } ,1000);
};
stopSender = function() {
  clearTimeout(timer);
}

body.onunload = function() {
  bodyAT.stop();
  bodyAT.sendAndReset({"motion-data": bodyAT.buffer()});
};

ex1StartButton.addEventListener("click", function(event) {
  bodyAT.start();
  // Remove this when DOM-events are available in AlgernonTrap
  stateSpan.innerHTML = "processing";
});

ex1StopButton.addEventListener("click", function(event) {
  bodyAT.stop();
  // Remove this when DOM-events are available in AlgernonTrap
  stateSpan.innerHTML = "stopped";
});

ex1ShowBufferButton.addEventListener("click", function(event) {
  var pre = document.getElementById("body-buffer");
  pre.innerHTML = bodyAT.buffer();
});

ex1ShowRawBufferButton.addEventListener("click", function(event) {
  var pre  = document.getElementById("body-buffer"),
    buffer = bodyAT.rawBuffer(),
    length = buffer.length,
    result = '',
    i = 0;
  for ( ; i < length; i++ ) {
    result += "["+buffer[i]+"] ";
  }
  pre.innerHTML = result;
});

ex1SendButton.addEventListener("click", function(event) {
  bodyAT.sendAndReset({"motion-data": bodyAT.buffer()});
});

// end of Example 1
