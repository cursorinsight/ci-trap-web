var assert = require('chai').assert;
var algernonTrap = require('../algernon-trap');

var doc = require('jsdom').jsdom('<html><body><div id="algernon-trap"></div></body></html>');
var window = doc.createWindow();

describe('algernon-trap API', function(){

  var aT = algernonTrap('#algernon-trap');

  it('should export start() function', function(){
    assert.isFunction(aT.start);
  });

  it('should export stop() function', function(){
    assert.isFunction(aT.stop);
  });

  it('should export buffer() function', function(){
    assert.isFunction(aT.buffer);
  });

});

