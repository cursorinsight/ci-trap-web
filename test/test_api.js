document = require("jsdom")
             .jsdom("<html><body><div id='algernon-trap'></div></body></html>");
window = document.createWindow();

var assert = require("chai").assert,
  AlgernonTrap = require("../src/algernon-trap");

describe("algernon-trap API", function() {

  var algernonTrap = AlgernonTrap("#algernon-trap");

  it("should export start() function", function() {
    assert.isFunction(algernonTrap.start);
  });

  it("should export stop() function", function() {
    assert.isFunction(algernonTrap.stop);
  });

  it("should export buffer() function", function() {
    assert.isFunction(algernonTrap.buffer);
  });

  it("should export send() function", function() {
    assert.isFunction(algernonTrap.send);
  });

});

