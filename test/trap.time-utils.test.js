import '@testing-library/jest-dom';

import timeUtils from '../src/timeUtils';

describe('buffer timeout', () => {
  beforeAll(() => {
    // Here you must use `jest.resetModules` because otherwise Jest will have
    // cached `trap.js` and it will _not_ run again.
    jest.resetModules();

    // Use fake timers -- it means that timers must be advanced manually!
    jest.useFakeTimers();
    timeUtils.actualizeEpoch();
  });

  afterAll(() => {
    // Use real timers from now on
    jest.useRealTimers();
  });

  test('sends chunks automatically on buffer timeout', () => {
    const startTime = timeUtils.currentTs();

    jest.advanceTimersByTime(100);

    const endTime = timeUtils.currentTs();
    timeUtils.actualizeEpoch();
    const newEndTime = timeUtils.currentTs();

    expect(endTime - startTime).toBe(100);
    expect(endTime).toEqual(newEndTime);
  });
});
