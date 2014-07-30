var assert = require("chai").assert,
  expect = require("chai").expect,
  sinon = require("sinon"),

  pretender = require("./support/pretender.js"),
  server = new pretender(function() {
    this.post("/", function(request) {
      return [200, {"Content-type": "appliction/json"}, "['ok']"];
    });
  }),

  algernonTrap = require("../algernon-trap");

describe("algernon-trap", function() {

  var aT,
    requests,
    callback,
    argument;
  
  before(function() {
    aT = algernonTrap(document.getElementsByTagName("body")[0]);
    callback = sinon.spy();
  });

  it("should send Ajax POST to server", function() {
    aT.sendAndReset({"motion-data": aT.buffer()}, callback);
    argument = callback.args[0][0];
    assert.equal(argument.readyState, 4);
    assert.equal(argument.responseText, "['ok']");
    assert.equal(argument.statusText,"OK");
  });

  it("should reset buffer", function() {
    aT.sendAndReset({"motion-data": aT.buffer()}, callback);
    assert.equal(aT.buffer(), "BA");
  });
});
