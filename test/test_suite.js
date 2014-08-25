var assert = require("chai").assert,
  AlgernonTrap = require("../src/algernon-trap");

describe("algernon-trap", function() {

  it("should be loaded", function() {
    assert.isFunction(AlgernonTrap);
  });

});
