import '@testing-library/jest-dom';
import fetch, { disableFetchMocks, enableFetchMocks } from 'jest-fetch-mock';

import trap from '../src/trap';

const initialHtml = '<html><head></head><body>some text</body></html>';

describe('custom API-KEY', () => {
  beforeAll(() => {
    document.body.innerHTML = initialHtml;

    // Here you must use `jest.resetModules` because otherwise Jest will have
    // cached `trap.js` and it will _not_ run again.
    jest.resetModules();

    // Enable fetch() mocks
    enableFetchMocks();

    // Load Trap and mount it into the `document`
    trap.mount(document);

    // Set up fetch() mocks
    fetch.mockResponse(() => Promise.resolve({ result: 'ok' }));
  });

  afterAll(() => {
    // Unload Trap
    trap.umount(document);

    // Disable fetch() mocks
    disableFetchMocks();
  });

  test('sets custom API-KEY value', async () => {
    // Set custom API-KEY value
    trap.apiKeyValue('custom-api-key-value');

    // Send a simple custom message
    trap.send('message');

    // Manually invoke chunk submission
    await trap.submit();

    // Expect a single chunk to be submitted
    expect(fetch).toHaveBeenCalledWith(
      expect.any(String), // path
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': expect.stringMatching('custom-api-key-value'),
        }),
      }),
    );
  });

  test('sets custom API-KEY name', async () => {
    // Set custom API-KEY value
    trap.apiKeyName('CUSTOM-API-KEY-NAME');

    // Send a simple custom message
    trap.send('message');

    // Manually invoke chunk submission
    await trap.submit();

    // Expect a single chunk to be submitted
    expect(fetch).toHaveBeenCalledWith(
      expect.any(String), // path
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': expect.stringMatching('CUSTOM-API-KEY-NAME'),
        }),
      }),
    );
  });

  test('sets custom API-KEY value using its legacy call', async () => {
    // Set custom API-KEY value
    trap.apiKey('legacy-api-key-value');

    // Send a simple custom message
    trap.send('message');

    // Manually invoke chunk submission
    await trap.submit();

    // Expect a single chunk to be submitted
    expect(fetch).toHaveBeenCalledWith(
      expect.any(String), // path
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': expect.stringMatching('legacy-api-key-value'),
        }),
      }),
    );
  });
});
