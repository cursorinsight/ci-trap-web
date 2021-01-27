import '@testing-library/jest-dom';
import fetch, { disableFetchMocks, enableFetchMocks } from 'jest-fetch-mock';
import { unzlibSync, strFromU8 } from 'fflate';

import trap from '../src/trap';

// Set up compressed transmission default
jest.mock('../src/constants', () => {
  const originalModule = jest.requireActual('../src/constants');

  return {
    __esModule: true,
    ...originalModule,
    DEFAULT_TRAP_ENABLE_COMPRESSION: true,
  };
});

const initialHtml = '<html><head></head><body>some text</body></html>';

describe('buffer limit', () => {
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

  test('sends compressed, binary chunks', () => {
    // Set up fetch() mocks
    fetch.mockResponse(() => Promise.resolve({ result: 'ok' }));

    // Send a new chunk with a message
    trap.send('message');
    trap.submit();

    // Expect a 'json+zlib' encoding in the header
    expect(fetch).toHaveBeenCalledWith(
      expect.any(String), // path
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': expect.stringMatching(/encoding=json\+zlib/),
        }),
      }),
    );

    // Expect 3 messages, header, metadata and a single message
    const compressed = fetch.mock.calls[0][1].body;
    const jsonString = strFromU8(unzlibSync(compressed));
    const object = JSON.parse(jsonString);
    expect(object).toHaveProperty('[2]', [
      expect.any(Number),
      expect.any(Number),
      expect.objectContaining({ message: 'message' }),
    ]);
  });
});
