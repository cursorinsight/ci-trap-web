import '@testing-library/jest-dom';
import fetch, { disableFetchMocks, enableFetchMocks } from 'jest-fetch-mock';

import trap from '../src/trap';

import {
  CUSTOM_MESSAGE_TYPE,
  HEADER_MESSAGE_TYPE,
} from '../src/constants';

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

  test('sends a single chunk', () => {
    // Send a simple custom message
    trap.send('message');

    // Manually invoke chunk submission
    trap.submit();

    // Expect a single chunk to be submitted
    expect(fetch).toHaveBeenCalledTimes(1);

    // Clear mock data
    fetch.mockClear();

    // Idle timer does not invoke a new chunk submission
    jest.advanceTimersByTime(2000);
    expect(fetch).toHaveBeenCalledTimes(0);
  });

  test('sends multiple chunks', () => {
    // Send a simple custom message
    trap.send('message');

    // Manually invoke chunk submission
    trap.submit();

    // Send another custom message
    trap.send('message');

    // Manually invoke chunk submission
    trap.submit();

    // Expect two chunks to be submitted
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  test('does not send an empty chunk', () => {
    // Manually invoke chunk submission without pushing data
    trap.submit();

    // Expect no chunks to be submitted
    expect(fetch).toHaveBeenCalledTimes(0);
  });

  test('In memory event collection disabled test', () => {
    trap.setCollectEvents(false);

    // Send a simple custom message
    trap.send('message');

    // Manually invoke chunk submission
    trap.submit();

    // Get the collected events in the in-memory buffer
    const collectedEvents = trap.flushCollectedEvents();

    // Ensure no data was captured in the in memory buffer
    expect(collectedEvents).toHaveLength(0);
  });

  test('In memory event collection enabled test', () => {
    trap.setCollectEvents(true);

    // Send a simple custom message
    trap.send('message');

    // Manually invoke chunk submission
    trap.submit();

    // Get the collected events in the in-memory buffer
    const collectedEvents = trap.flushCollectedEvents();

    // Ensure data was captured in the in memory buffer
    expect(collectedEvents).toHaveLength(2);

    // First message is header
    expect(collectedEvents[0][0]).toEqual(HEADER_MESSAGE_TYPE);

    // Second message is the custom event
    expect(collectedEvents[1]).toMatchObject([
      CUSTOM_MESSAGE_TYPE,
      expect.any(Number),
      expect.objectContaining({
        message: 'message',
      }),
    ]);
  });
});
