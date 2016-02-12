// TODO normalize test cases and contexts

// TODO simulateMouseMove is a very bad idea, it must be replaced ASAP
//
// Nextgen simulateMouseMove should support the followings:
// * time-based event triggering (it's hard! https://github.com/jamesarosen/Timecop.js)
// * exact screen / client -- X / Y handling
// * it must be moved to a supporting JS file that can be loaded several times from several sources

var assert = require('chai').assert
var expect = require('chai').expect
var sinon = require('sinon')

var pretender = require('./support/pretender.js')
var server = new pretender(function () {
  this.post('/s', function (request) {
    return [200, {'Content-type': 'appliction/json'}, '["ok"]']
  })
})

var ciTrap = require('../src/ci-trap')

describe('ci-trap after two mouse moves', function () {

  function simulateMouseMove (sX, sY, cX, cY, t) {
    var e = document.createEvent('MouseEvents')
    // for details: https://developer.mozilla.org/en-US/docs/Web/API/event.initMouseEvent
    e.initMouseEvent('mousemove', true, true, window, 0, sX, sY, cX, cY, false, false, false, false, null, null)
    //e.timeStamp = t; // << it's not working.. :/
    document.body.dispatchEvent(e)
  }

  var ciTrapInstance
  var requests
  var callback
  var argument

  before(function () {
    ciTrapInstance = ciTrap()

    ciTrapInstance.start()
    simulateMouseMove(10, 20, 30, 50, 'time placeholder!')
    //simulateMouseMove(11, 22, 31, 52);
    ciTrapInstance.stop()

    callback = sinon.spy()
  })

  it('should have motion-data in its buffer', function () {
    assert.equal(ciTrapInstance.buffer(), 'AAAAAAKAAU')
  })

  it('should send data to server in a POST', function () {
    ciTrapInstance.send(false, callback)
    argument = callback.args[0][0]
    assert.equal(argument.readyState, 4)
    assert.equal(argument.responseText, '["ok"]')
    assert.equal(argument.statusText,'OK')
  })

  it('should reset buffer after a POST', function () {
    ciTrapInstance.send()
    assert.equal(ciTrapInstance.buffer(), '')
  })
})
