import '@testing-library/jest-dom';
import fetch, { disableFetchMocks, enableFetchMocks } from 'jest-fetch-mock';

import trap from '../src/trap';

const initialHtml = '<html><head></head><body>some text</body></html>';

describe('custom Trap Server URL', () => {
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

  test('sets a custom URL', async () => {
    // Set custom URL
    trap.url('//custom.domain/with/path?and=arguments');

    // Load Trap and mount it into the `document`
    trap.mount(document);

    // Send a simple custom message
    trap.send('message');

    // Default idle timer waits for 2 seconds.
    await trap.submit();

    expect(fetch).toHaveBeenCalledWith(
      'http://custom.domain/with/path?and=arguments',
      expect.any(Object), // body
    );
  });

  test('sets a custom URL with session and stream ids', async () => {
    // Set custom URL
    // eslint-disable-next-line no-template-curly-in-string
    trap.url('//custom.domain/${sessionId}/${streamId}?and=arguments');

    // Load Trap and mount it into the `document`
    trap.mount(document);

    // Send a simple custom message
    trap.send('message');

    // Default idle timer waits for 2 seconds.
    await trap.submit();

    // Check whether the URL consists of the replaced content
    const sessionId = trap.sessionId();
    const streamId = trap.streamId();
    expect(fetch).toHaveBeenCalledWith(
      `http://custom.domain/${sessionId}/${streamId}?and=arguments`,
      expect.any(Object), // body
    );
  });
});
