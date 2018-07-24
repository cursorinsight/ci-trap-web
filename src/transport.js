var map = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

// @constant
var head = 'BB'; // v2 :)

// buffer

// Locals.
var url = '/s';
var headers = {};
var sessionID;
var counter = 1;

class Transport {
  constructor (window) {
    this.window = window;
    this.encodeWrapper = window.encodeURIComponent;
    this.buffer = '';
    this.send = this.send.bind(this);
  }

  encodeValues (values, sizes) {
    var idx;
    var len = values.length;
    var bc = 0; // bit counter
    var cv; // current value
    var av = 0; // actual value
    var size;
    var results = '';

    for (idx = 0; idx < len; idx++) {
      cv = values[idx];
      size = sizes[idx];
      if (cv < 0) { cv = 0; }
      if (cv > ((2 << size) - 1)) { cv = ((2 << size) - 1); }
      if (av > 0) {
        av = av << size;
      }
      av |= cv & ((1 << size) - 1);
      bc += size;
      while (bc > 6) {
        bc -= 6;
        results += map[av >>> bc];
        av &= (1 << bc) - 1;
      }
    }

    results += map[av << (6 - bc)];

    return results;
  };

  encodeHeaders (headers) {
    var headerString = '';

    for (var key in headers) {
      if (headers.hasOwnProperty(key)) {
        headerString = headerString +
          this.encodeWrapper(key) + '=' +
          this.encodeWrapper(headers[key]) + ',';
      }
    }

    return this.encodeValues([headerString.length], [12]) + headerString;
  };

  /*
   * @private
   * Resets buffer.
   */
  reset () {
    this.buffer = '';
    return true;
  }

  /*
   * @private
   * Shifts available data.  That means resetting to its defaults and returning
   * already collected events.
   */
  shift () {
    var contents = this.buffer;
    this.reset();
    return contents;
  }

  /*
   * @private
   * Encodes raw bytes into stream format (length + URI encoded string
   * representation).
   */
  encodeRawBytes (bytes) {
    var encoded = this.encodeWrapper(bytes);
    return this.encodeValues([encoded.length], [12]) + encoded;
  }

  send (sync, callback) {
    try {
      var x = new window.XMLHttpRequest();
      x.open('POST', url, true);
      x.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
      x.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
      x.onreadystatechange = function () { // Call a function when the state changes.
        if (callback) {
          callback(x);
        }
      };

      headers['stream-id'] = (sessionID) + '.' + (counter++);
      x.send(head + this.encodeHeaders(headers) + this.shift());
    } catch (e) {
      window.console && console.log(e);
    }
  };
  /**
   * Sends data to destination.
   */
  // send(sync, callback) {
  //   var
  //     req = new window.XMLHttpRequest(),
  //     onResponse = function () {
  //       if (callback) {
  //         if ((req.readyState === 4) && (req.status === 200)) {
  //           callback(req);
  //         } else {
  //           console.log("Failure")
  //         }
  //       }
  //     },
  //     onSuccess = function () { console.log("success") }, // TODO
  //     onFailure = function () { console.log("Failure") }; // TODO

  //   // TODO make it configurable (enable/disable) w//o
  //   headers["stream-id"] = (sessionID ? sessionID : "") + "." + (counter++);

  //   if ("withCredentials" in req) { // Is it a real XMLHttpRequest2 object
  //     req.open("POST", url, !sync);
  //     req.onreadystatechange = onResponse; // TODO XMLHttpRequest2 has onload and co...
  //     req.setRequestHeader("Content-type", "text/plain");
  //     // req.withCredentials = true;
  //   } else if (typeof this.window.XDomainRequest !== "undefined") { // XDomainRequest only exists in IE
  //     req = new this.window.XDomainRequest();
  //     req.onload = onSuccess;
  //     req.onerror = onFailure;
  //     req.contentType = "text/plain";
  //     req.open("POST", url);
  //   } else if (typeof this.window.ActiveXObject !== "undefined") { // Is it OK? :)
  //     req = new this.window.ActiveXObject("Microsoft.XMLHTTP");
  //     req.open("POST", url);
  //   } else {
  //     // TODO Firefox in test mode get to this branch
  //     req.open("POST", url, !sync);
  //     req.onload = onResponse;
  //     req.setRequestHeader("Content-type", "text/plain");
  //     //req = null;
  //     //throw new Error('CORS not supported'); // TODO
  //   }
  //   console.log(head + this.encodeHeaders(headers) + this.shift());
  //   req.send(head + this.encodeHeaders(headers) + this.shift());

  //   return true;
  // };

  /**
   * Sets destination URL.
   */
  setUrl (u) {
    url = u;
  };

  /**
   * Sets request header k/v pair.
   */
  setHeader (key, value) {
    headers[key] = value;
  };

  /**
   * Sets session ID for this session.
   */
  setSessionID (s) {
    sessionID = s;
  };

  /**
   * Returns current buffer contents (without version magic and headers).
   */
  getBuffer () {
    return this.buffer;
  };

  /**
   * Encodes and pushes values sampled by its given size into buffer.
   */
  push (values, sizes) {
    this.buffer += this.encodeValues(values, sizes);
    return this.buffer;
  };

  /**
   * Encodes raw bytes into stream format (length + URI encoded string
   * representation).
   */
  // this.encodeRawBytes = encodeRawBytes;

  /**
   * Appends raw (encoded) bytes to buffer.
   */
  pushRawBytes (bytes) {
    this.buffer += this.encodeRawBytes(bytes);
    return this.buffer;
  };

  /**
   * Resets buffer.
   */
  // this.reset = reset;

  // ---------------------------------------------------------------------------
};

export default Transport;
