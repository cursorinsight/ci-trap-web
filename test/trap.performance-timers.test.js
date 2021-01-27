import '@testing-library/jest-dom';
import fetch, { disableFetchMocks, enableFetchMocks } from 'jest-fetch-mock';

import trap from '../src/trap';

// Disable `performance.timeOrigin` support to enable manual `timeOrigin`
// calculations
jest.mock('../src/constants', () => {
  const originalModule = jest.requireActual('../src/constants');

  return {
    __esModule: true,
    ...originalModule,
    PERFORMANCE_TIMEORIGIN_ENABLED: false,
  };
});

const initialHtml = '<html><head></head><body>some text</body></html>';

describe('browser with performance timers', () => {
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

  test('triggers a custom event', () => {
    // Set up fetch() mocks
    fetch.mockResponse(() => Promise.resolve({ result: 'ok' }));

    // Send a simple custom message
    trap.send('message');

    // Default idle timer waits for 2 seconds.
    jest.advanceTimersByTime(2000);

    expect(fetch).toHaveBeenCalledTimes(1);

    // TODO: check sent chunk
  });
});
