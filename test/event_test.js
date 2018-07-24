import { assert } from 'chai';
import CITrap from '../src/index';

/* global before, it, describe */
describe('CI-Trap API', function () {
  var ciTrap;

  function simulateMouseMove (sX, sY, cX, cY, t) {
    var e = document.createEvent('MouseEvents');
    // for details: https://developer.mozilla.org/en-US/docs/Web/API/event.initMouseEvent
    e.initMouseEvent('mousemove', true, true, window, 0, sX, sY, cX, cY, false, false, false, false, null, null);
    document.body.dispatchEvent(e);
  };

  before(function () {
    ciTrap = new CITrap();

    ciTrap.start();
    simulateMouseMove(10, 20, 30, 50, 'time placeholder!');
    ciTrap.stop();
  });

  it('should have motion-data in its buffer', function () {
    assert.equal(ciTrap.buffer(), 'AAAAAAKAAU');
  });
});
