// TODO normalize test cases and contexts

// TODO simulateMouseMove is a very bad idea, it must be replaced ASAP
//
// Nextgen simulateMouseMove should support the followings:
// * time-based event triggering (it's hard! https://github.com/jamesarosen/Timecop.js)
// * exact screen / client -- X / Y handling
// * it must be moved to a supporting JS file that can be loaded several times from several sources

var assert = require("chai").assert,
  expect = require("chai").expect,
  sinon = require("sinon"),

  pretender = require("./support/pretender.js"),
  server = new pretender(function() {
    this.post("/v1", function(request) {
      return [200, {"Content-type": "appliction/json"}, "['ok']"];
    });
  }),

  algernonTrap = require("../src/algernon-trap");

describe("algernon-trap after two mouse moves", function() {

  function simulateMouseMove(sX, sY, cX, cY, t) {
    var e = document.createEvent("MouseEvents");
    // for details: https://developer.mozilla.org/en-US/docs/Web/API/event.initMouseEvent
    e.initMouseEvent("mousemove", true, true, window, 0, sX, sY, cX, cY, false, false, false, false, null, null);
    //e.timeStamp = t; // << it's not working.. :/
    document.body.dispatchEvent(e);
  };

  var algernonTrapInstance,
    requests,
    callback,
    argument;
  
  before(function() {
    algernonTrapInstance = algernonTrap();

    algernonTrapInstance.start();
    simulateMouseMove(10, 20, 30, 50, "time placeholder!");
    //simulateMouseMove(11, 22, 31, 52);
    algernonTrapInstance.stop();

    callback = sinon.spy();
  });

  it("should have motion-data in its buffer", function() {
    assert.equal(algernonTrapInstance.buffer(), "BAAAAoU");
  });

  it("should send data to server in a POST", function() {
    algernonTrapInstance.send("some session id", false, callback);
    argument = callback.args[0][0];
    assert.equal(argument.readyState, 4);
    assert.equal(argument.responseText, "['ok']");
    assert.equal(argument.statusText,"OK");
  });

  it("should reset buffer after a POST", function() {
    algernonTrapInstance.send();
    assert.equal(algernonTrapInstance.buffer(), "BA");
  });
});
