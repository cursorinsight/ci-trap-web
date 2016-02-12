var assert = require("chai").assert
var CITrap = require("../src/ci-trap")

describe("ci-trap", function () {

  it("should be loaded", function () {
    assert.isFunction(CITrap)
  })

})
