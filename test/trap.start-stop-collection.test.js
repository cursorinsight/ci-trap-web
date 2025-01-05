import '@testing-library/jest-dom';
import fetch, { disableFetchMocks, enableFetchMocks } from 'jest-fetch-mock';

import trap from '../src/trap';

const initialHtml = '<html><head></head><body>some text</body></html>';

describe('trap', () => {
  beforeAll(() => {
    document.body.innerHTML = initialHtml;

    // Here you must use `jest.resetModules` because otherwise Jest will have
    // cached `trap.js` and it will _not_ run again.
    jest.resetModules();

    // Enable fetch() mocks
    enableFetchMocks();

    // Load Trap and mount it into the `document`
    trap.mount(document);
  });

  afterAll(() => {
    // Disable fetch() mocks
    disableFetchMocks();
  });

  test('#stop disables automatic data collection', () => {
    // Set up fetch() mocks
    fetch.mockResponse(() => Promise.resolve({ result: 'ok' }));

    // Send a message to be able to test a successful `submit`
    trap.send('message');

    // Call `stop`
    trap.stop();

    // Check for that `submit`
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  test('sending new events are omitted', async () => {
    // 10000 is more than DEFAULT_TRAP_BUFFER_SIZE_LIMIT
    [...Array(10000)].forEach(() => trap.send('message'));
    expect(fetch).toHaveBeenCalledTimes(0);

    // Submit a new event manually
    trap.send('message');
    await trap.submit();
    expect(fetch).toHaveBeenCalledTimes(0);
  });

  test('#start reenables automatic data collection', async () => {
    trap.start();
    // Send a message and call `submit` manually
    trap.send('message');
    await trap.submit();
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  test('#stop submits collected data', () => {
    // Send a message and call `stop`
    trap.send('message');

    trap.stop();
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
