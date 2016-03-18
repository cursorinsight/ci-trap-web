
var TransportHandler = function (element, transport) {
  var sendEventName = "ct:send"

  var sendHandler = function (event) {
    transport.send()
    if (event.callback) { event.callback() }
  }

  this.start = function () {
    element.addEventListener(sendEventName, sendHandler)
  }

  this.stop = function () {
    element.removeEventListener(sendEventName, sendHandler)
  }
}

module.exports = TransportHandler
