var assert = require("chai").assert,
  algernonTrap = require("../src/algernon-trap");

describe("algernon-trap", function() {

  it("should be loaded", function() {
    assert.isFunction(algernonTrap);
  });

});
