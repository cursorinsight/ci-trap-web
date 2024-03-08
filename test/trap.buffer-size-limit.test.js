import '@testing-library/jest-dom';
import fetch, { disableFetchMocks, enableFetchMocks } from 'jest-fetch-mock';

import trap from '../src/trap';

const initialHtml = '<html><head></head><body>some text</body></html>';

// Set up a buffer size limit -- 10 events in this case
jest.mock('../src/constants', () => {
  const originalModule = jest.requireActual('../src/constants');

  return {
    __esModule: true,
    ...originalModule,
    DEFAULT_TRAP_BUFFER_SIZE_LIMIT: 10,
  };
});

describe('buffer size limit', () => {
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

  test('sends chunks automatically on buffer fill', () => {
    // Set up fetch() mocks
    fetch.mockResponse(() => Promise.resolve({ result: 'ok' }));

    // Send exactly (bufferSizeLimit-1) number of messages and does not expect
    // a chunk submission.
    [...Array(9)].forEach(() => trap.send('message'));
    expect(fetch).toHaveBeenCalledTimes(0);

    // Send one more triggers submission
    trap.send('message');
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
