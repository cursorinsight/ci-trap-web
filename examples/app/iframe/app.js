/* global window document require */

(function (global, window, document, require) {
  'use strict'
  // ---------------------------------------------------------------------------

  // Mini-apps demonstrating CITrap's functions.

  var CITrap = require('../../../src/ci-trap')

  // Example 0 -- export CITrap to play around.
  window.CITrap = CITrap
  // end of Example 0

  // Example 1 -- start-stop-send buttons
  var ciTrap = new CITrap()
  window.ciTrap = ciTrap
  ciTrap.setSessionID('APP')

  var ex1StartButton = document.getElementById('ex1-start')
  var ex1StopButton = document.getElementById('ex1-stop')
  var ex1ShowBufferButton = document.getElementById('ex1-show-buffer')
  var ex1MarkButton = document.getElementById('ex1-mark')
  var ex1DebugButton = document.getElementById('ex1-debug')
  var ex1SendButton = document.getElementById('ex1-send')

  var stateSpan = document.getElementById('window-state')

  ex1StartButton.addEventListener('click', function (event) {
    if (event.preventDefault) { event.preventDefault() } else { event.returnValue = false }
    ciTrap.start()
    // Remove this when DOM-events are available in CITrap
    stateSpan.innerHTML = 'processing'
  })

  ex1StopButton.addEventListener('click', function (event) {
    if (event.preventDefault) { event.preventDefault() } else { event.returnValue = false }
    ciTrap.stop()
    // Remove this when DOM-events are available in CITrap
    stateSpan.innerHTML = 'stopped'
  })

  ex1ShowBufferButton.addEventListener('click', function (event) {
    if (event.preventDefault) { event.preventDefault() } else { event.returnValue = false }
    var pre = document.getElementById('window-buffer')
    pre.innerHTML = ciTrap.buffer()
  })

  ex1MarkButton.addEventListener('click', function (event) {
    if (event.preventDefault) { event.preventDefault() } else { event.returnValue = false }
    var markEvent = new window.Event('at:mark')
    var markInput = document.getElementById('ex1-mark-input')
    var text = markInput.value
    if (text) { markEvent.text = text }
    if (ciTrap.element) {
      ciTrap.element.dispatchEvent(markEvent)
    }
    stateSpan.innerHTML = 'sent'
  })

  ex1DebugButton.addEventListener('click', function (event) {
    if (event.preventDefault) { event.preventDefault() } else { event.returnValue = false }
    var debugEvent = new window.Event('at:debug')
    if (ciTrap.element) {
      ciTrap.element.dispatchEvent(debugEvent)
    }
    stateSpan.innerHTML = 'sent'
  })

  ex1SendButton.addEventListener('click', function (event) {
    if (event.preventDefault) { event.preventDefault() } else { event.returnValue = false }
    ciTrap.send(false, function () { stateSpan.innerHTML = 'sent' })
  })

  // end of Example 1

  // ---------------------------------------------------------------------------
}) (this, window, document, require)
