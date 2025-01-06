import '@testing-library/jest-dom';
import fetch, { disableFetchMocks, enableFetchMocks } from 'jest-fetch-mock';

import trap from '../src/trap';

const initialHtml = '<html><head></head><body>some text</body></html>';

describe('sending chunks', () => {
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

  beforeEach(() => {
    // Set up fetch() mocks
    fetch.mockResponse(() => Promise.resolve({ result: 'ok' }));
  });

  test('sends a single chunk', async () => {
    // Send a simple custom message
    trap.send('message');

    // Manually invoke chunk submission
    await trap.submit();

    // Expect a single chunk to be submitted
    expect(fetch).toHaveBeenCalledTimes(1);

    // Clear mock data
    fetch.mockClear();

    // Idle timer does not invoke a new chunk submission
    jest.advanceTimersByTime(2000);
    expect(fetch).toHaveBeenCalledTimes(0);
  });

  test('sends multiple chunks', async () => {
    // Send a simple custom message
    trap.send('message');

    // Manually invoke chunk submission
    await trap.submit();

    // Send another custom message
    trap.send('message');

    // Manually invoke chunk submission
    await trap.submit();

    // Expect two chunks to be submitted
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  test('does not send an empty chunk', async () => {
    // Manually invoke chunk submission without pushing data
    await trap.submit();

    // Expect no chunks to be submitted
    expect(fetch).toHaveBeenCalledTimes(0);
  });
});
