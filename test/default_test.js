import { assert } from 'chai';
import CITrap from '../src/index';

/* global it, describe */
describe('CI-Trap API', function () {
  var ciTrap = new CITrap();

  it('should export the start()', function () {
    assert.isFunction(ciTrap.start);
  });

  it('should export stop()', function () {
    assert.isFunction(ciTrap.stop);
  });

  it('should export buffer()', function () {
    assert.isFunction(ciTrap.buffer);
  });

  it('should export send()', function () {
    assert.isFunction(ciTrap.send);
  });

  it('should be ok', function () {
    assert.equal('ok', 'ok');
  });
});
