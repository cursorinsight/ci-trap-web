import '@testing-library/jest-dom';
import fetch, { disableFetchMocks, enableFetchMocks } from 'jest-fetch-mock';

import trap from '../src/trap';

const initialHtml = '<html><head></head><body>some text</body></html>';

// Set up a buffer timeout -- 1000 milliseconds (1 second) in this case
jest.mock('../src/constants', () => {
  const originalModule = jest.requireActual('../src/constants');

  return {
    __esModule: true,
    ...originalModule,
    DEFAULT_TRAP_BUFFER_TIMEOUT: 1000,
  };
});

describe('buffer timeout', () => {
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
  });

  afterAll(() => {
    // Disable fetch() mocks
    disableFetchMocks();

    // Use real timers from now on
    jest.useRealTimers();
  });

  test('sends chunks automatically on buffer fill', () => {
    // Set up fetch() mocks
    fetch.mockResponse(() => Promise.resolve({ result: 'ok' }));

    // Send a few messages
    [...Array(100)].forEach(() => trap.send('message'));
    expect(fetch).toHaveBeenCalledTimes(0);

    // Advance time by 0.999 seconds
    jest.advanceTimersByTime(999);
    expect(fetch).toHaveBeenCalledTimes(0);

    // Advance time by 0.001 seconds to T0+1 second
    jest.advanceTimersByTime(1);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
