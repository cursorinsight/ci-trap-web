/* global module */

var Transport = function(window, url, buffer) {
"use strict";
// ---------------------------------------------------------------------------

function serialize(data) {
  var 
    // It's a fixed hash with only 1 key (and value).
    parameters = {"motion-data": data},

    dataString = "",
    parametersLength = 0,
    key;

  for (key in parameters) {
    if (parameters.hasOwnProperty(key)) {
      parametersLength++;
    }
  }

  for (key in parameters) {
    if (parameters.hasOwnProperty(key)) {
      dataString += key + "=" + encodeURIComponent(parameters[key].toString());
      parametersLength--;
      if (parametersLength > 0) {
        dataString += "&";
      }
    }
  }

  return dataString;
}

this.send = function(callback) {
  var req;

  if (window.XMLHttpRequest) { // code for IE7+, Firefox, Chrome, Opera, Safari
    req = new window.XMLHttpRequest();
  } else { // code for IE6, IE5
    req = new window.ActiveXObject("Microsoft.XMLHTTP");
  }

  req.onreadystatechange = function() {
    if (callback){
      if ((req.readyState === 4) && (req.status === 200)) {
        callback(req);
      }
    }
  };
  req.open("POST", url, true);
  req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  req.send(serialize(buffer.shift()));

  return true;
};

// ---------------------------------------------------------------------------
};

module.exports = Transport;
