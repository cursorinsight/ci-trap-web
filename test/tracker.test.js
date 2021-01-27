import '@testing-library/jest-dom';
import fetch, { disableFetchMocks, enableFetchMocks } from 'jest-fetch-mock';

import tracker from '../src/tracker';

const initialHtml = '<html><head></head><body>some text</body></html>';

describe('Tracker', () => {
  beforeAll(() => {
    document.body.innerHTML = initialHtml;

    // Here you must use `jest.resetModules` because otherwise Jest will have
    // cached `trap.js` and it will _not_ run again.
    jest.resetModules();

    // Enable fetch() mocks
    enableFetchMocks();

    // Set up fetch() mocks
    fetch.mockResponse(() => Promise.resolve({ result: 'ok' }));
  });

  afterAll(() => {
    // Disable fetch() mocks
    disableFetchMocks();
  });

  test('sends a custom message', () => {
    // Send a simple custom message
    tracker.apply(['send', 'message']);

    // Manually invoke submit
    tracker.apply(['submit']);

    // Check submission
    expect(fetch).toHaveBeenCalled();
  });

  test('checks trap metadata availability', () => {
    expect(tracker.apply(['sessionId'])).toMatch(/^[-0-9a-f]{36}$/);
    expect(tracker.apply(['streamId'])).toMatch(/^[-0-9a-f]{36}$/);
  });
});
