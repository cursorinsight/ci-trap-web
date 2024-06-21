import '@testing-library/jest-dom';
import fetch, { disableFetchMocks, enableFetchMocks } from 'jest-fetch-mock';

import { METADATA_MESSAGE_TYPE } from '../src/constants';
import trap from '../src/trap';

const initialHtml = '<html><head></head><body>some text</body></html>';
const customKey = 'custom-key';
const customValue = 'custom-value';

describe('custom metadata', () => {
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

  test('sets a custom key/value pair', () => {
    // Set up fetch() mocks
    fetch.mockResponse(() => Promise.resolve({ result: 'ok' }));

    // Set custom K/V pair
    trap.addCustomMetadata(customKey, customValue);

    // Send a simple custom message
    trap.send('message');

    // Manually invoke chunk submission
    trap.submit();

    // Fetch "fetch body" and parse its JSON
    const jsonBody = JSON.parse(fetch.mock.calls[0][1].body);

    // Select first metadata event
    const metadata = jsonBody.filter((e) => e[0] === METADATA_MESSAGE_TYPE)[0];

    // Expect a single chunk to be submitted with the actual "custom-key":
    // "custom-value" keypair serialized into the body
    expect(metadata).toHaveProperty(`2.custom.${customKey}`, customValue);
  });

  test('Add and remove custom metadata', () => {
    // Set up fetch() mocks
    fetch.mockResponse(() => Promise.resolve({ result: 'ok' }));

    // Set custom K/V pair
    trap.addCustomMetadata(customKey, customValue);

    // Manually invoke chunk submission
    trap.submit();

    // Fetch "fetch body" and parse its JSON
    let jsonBody = JSON.parse(fetch.mock.calls[0][1].body);

    // Select first metadata event
    let metadata = jsonBody.filter((e) => e[0] === METADATA_MESSAGE_TYPE)[0];

    // Expect a single chunk to be submitted with the actual "custom-key":
    // "custom-value" keypair serialized into the body
    expect(metadata).toHaveProperty(`2.custom.${customKey}`, customValue);

    // Removes the custom key
    trap.removeCustomMetadata(customKey);

    // Manually invoke chunk submission
    trap.submit();

    // Fetch "fetch body" and parse its JSON
    jsonBody = JSON.parse(fetch.mock.calls[1][1].body);

    // Select first metadata event
    [metadata] = jsonBody.filter((e) => e[0] === METADATA_MESSAGE_TYPE);

    // Expect no custom metadata
    expect(metadata).toHaveProperty('2.custom', {});
  });
});
