document = require('jsdom')
             .jsdom('<html><body><div id="ci-trap"></div></body></html>')
window = document.createWindow()

var assert = require('chai').assert
var CITrap = require('../src/ci-trap')

describe('ci-trap API', function () {

  var ciTrap = CITrap('#ci-trap')

  it('should export start() function', function () {
    assert.isFunction(ciTrap.start)
  })

  it('should export stop() function', function () {
    assert.isFunction(ciTrap.stop)
  })

  it('should export buffer() function', function () {
    assert.isFunction(ciTrap.buffer)
  })

  it('should export send() function', function () {
    assert.isFunction(ciTrap.send)
  })

})

