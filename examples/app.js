// Mini-apps demonstrating AlgernonTrap's functions.

var algernonTrap = require('./algernon-trap.js');

// Example 0 -- export AlgernonTrap to play around.
window.AT = algernonTrap;
// end of Example 0

// Example 1 -- start-stop-send buttons

// "ajax" helper fn.
function send(parameters) {
  var req, dataString='';

  var parametersLength=0;
  for (var key in parameters) {
    if (parameters.hasOwnProperty(key)) { parametersLength++; }
  }
  for (var key in parameters) {
    if (parameters.hasOwnProperty(key)) {
      dataString += key + '=' + encodeURIComponent(parameters[key].toString());
      parametersLength--;
      if (parametersLength>0) {
        dataString += '&';
      }
    }
  }

  if (window.XMLHttpRequest) { // code for IE7+, Firefox, Chrome, Opera, Safari
    req = new XMLHttpRequest();
  } else { // code for IE6, IE5
    req = new ActiveXObject('Microsoft.XMLHTTP');
  }
  req.onreadystatechange = function() {
    if (req.readyState==4 && req.status==200) {
      //document.getElementById("results").innerHTML = xmlhttp.responseText;
    }
  }
  req.open('POST', '/', true);
  req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  req.send(dataString);
}

var body   = document.getElementsByTagName('body')[0];
var bodyAT = algernonTrap(body);

var ex1StartButton          = document.getElementById('ex1-start');
var ex1StopButton           = document.getElementById('ex1-stop');
var ex1ShowBufferButton     = document.getElementById('ex1-show-buffer');
var ex1ShowRawBufferButton  = document.getElementById('ex1-show-raw-buffer');
var ex1SendButton           = document.getElementById('ex1-send');

var stateSpan = document.getElementById('body-state');

ex1StartButton.addEventListener('click', function(event) {
  bodyAT.start();
  // Remove this when DOM-events are available in AlgernonTrap
  stateSpan.innerHTML = 'processing';
});

ex1StopButton.addEventListener('click', function(event) {
  bodyAT.stop();
  // Remove this when DOM-events are available in AlgernonTrap
  stateSpan.innerHTML = 'stopped';
});

ex1ShowBufferButton.addEventListener('click', function(event) {
  var pre = document.getElementById('body-buffer');
  pre.innerHTML = bodyAT.buffer();
});

ex1ShowRawBufferButton.addEventListener('click', function(event) {
  var pre = document.getElementById('body-buffer');
  var buffer = bodyAT.rawBuffer(), length = buffer.length, result = '';
  for (var i=0; i<length; i++) {
    result += '['+buffer[i]+'] ';
  }
  pre.innerHTML = result;
});

ex1SendButton.addEventListener('click', function(event) {
  send({ 'motion-data': bodyAT.buffer() });
});

// end of Example 1
