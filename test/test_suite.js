var assert = require("chai").assert,
  algernonTrap = require("../algernon-trap");

describe("algernon-trap", function() {

  it("should be loaded", function() {
    assert.isFunction(algernonTrap);
  });

});
