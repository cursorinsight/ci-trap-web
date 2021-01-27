import '@testing-library/jest-dom';
import fetch, { disableFetchMocks, enableFetchMocks } from 'jest-fetch-mock';

import trap from '../src/trap';

const initialHtml = '<html><head></head><body>some text</body></html>';

// Set up a custom idle timeout -- e.g. 1 minute
jest.mock('../src/constants', () => {
  const originalModule = jest.requireActual('../src/constants');

  return {
    __esModule: true,
    ...originalModule,
    DEFAULT_TRAP_IDLE_TIMEOUT: 60000,
  };
});

describe('idle timeout', () => {
  beforeAll(() => {
    document.body.innerHTML = initialHtml;

    // Here you must use `jest.resetModules` because otherwise Jest will have
    // cached `trap.js` and it will _not_ run again.
    jest.resetModules();

    // Use fake timers -- it means that timers must be advanced manually!
    jest.useFakeTimers();

    // Enable fetch() mocks
    enableFetchMocks();

    // Load Trap and mount it into the `document`
    trap.mount(document);

    // Set up fetch() mocks
    fetch.mockResponse(() => Promise.resolve({ result: 'ok' }));
  });

  afterAll(() => {
    // Disable fetch() mocks
    disableFetchMocks();

    // Use real timers from now on
    jest.useRealTimers();
  });

  test('sends chunk automatically on preset timeout', () => {
    // Send a single message to test timeout
    trap.send('message');

    // Wait for a milliseconds less than 1 minute
    jest.advanceTimersByTime(59999);

    // Expect no chunk submission
    expect(fetch).not.toHaveBeenCalled();

    // Advance a single millisecond...
    jest.advanceTimersByTime(1);

    // ...et voila.
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  test('sets custom timeout', () => {
    // Set timeout
    trap.idleTimeout(1000);

    // Send a single message to test timeout
    trap.send('message');

    // Wait for a milliseconds less than 1 minute
    jest.advanceTimersByTime(999);

    // Expect no chunk submission
    expect(fetch).not.toHaveBeenCalled();

    // Advance a single millisecond...
    jest.advanceTimersByTime(1);

    // ...et voila.
    expect(fetch).toHaveBeenCalledTimes(1);

    // Clear mocks
    fetch.mockClear();

    // Advance another minute
    jest.advanceTimersByTime(60000);

    // And check that no other submissions were done
    expect(fetch).not.toHaveBeenCalled();
  });

  test('disables idle timer', () => {
    // Disable idle timeout
    trap.idleTimeout(undefined);

    // Send a single message to test timeout
    trap.send('message');

    // Wait for an eternity
    jest.advanceTimersByTime(999999999);

    // Expect no chunk submission
    expect(fetch).not.toHaveBeenCalled();
  });
});
