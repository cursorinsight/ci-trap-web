import '@testing-library/jest-dom';
import fetch, { disableFetchMocks, enableFetchMocks } from 'jest-fetch-mock';

import { CUSTOM_EVENT_TYPE } from '../src/constants';
import trap from '../src/trap';

const initialHtml = '<html><head></head><body>some text</body></html>';

describe('custom message', () => {
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

  test('sends custom message', () => {
    // Set up fetch() mocks
    fetch.mockResponse(() => Promise.resolve({ result: 'ok' }));

    // Send a simple custom message
    trap.send('message');

    // Manually invoke submit
    trap.submit();

    // Fetch "fetch body" and parse its JSON
    const jsonBody = JSON.parse(fetch.mock.calls[0][1].body);

    // Select first custom message event
    const message = jsonBody.filter((e) => e[0] === CUSTOM_EVENT_TYPE)[0];

    // Check first event's third argument -- which is an object
    expect(message).toMatchObject([
      expect.any(Number),
      expect.any(Number),
      expect.objectContaining({ message: 'message' }),
    ]);
  });

  test('sends custom object', () => {
    // Set up fetch() mocks
    fetch.mockResponse(() => Promise.resolve({ result: 'ok' }));

    // Send a simple custom message
    trap.send({ custom: 'object' });

    // Manually invoke submit
    trap.submit();

    // Fetch "fetch body" and parse its JSON
    const jsonBody = JSON.parse(fetch.mock.calls[0][1].body);

    // Select first custom message event
    const message = jsonBody.filter((e) => e[0] === CUSTOM_EVENT_TYPE)[0];

    expect(message).toMatchObject([
      expect.any(Number),
      expect.any(Number),
      expect.objectContaining({ custom: 'object' }),
    ]);
  });
});
