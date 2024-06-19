// `trap.header.test.js` tests the integrity of the header information, e.g.
// when invoking multiple HTTP submissions.

import '@testing-library/jest-dom';
import fetch, { disableFetchMocks, enableFetchMocks } from 'jest-fetch-mock';

import { HEADER_MESSAGE_TYPE } from '../src/constants';
import trap from '../src/trap';

const initialHtml = '<html><head></head><body>some text</body></html>';

describe('header', () => {
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

  beforeEach(() => {
    // Set up fetch() mocks
    fetch.mockResponse(() => Promise.resolve({ result: 'ok' }));

    trap.start();
  });

  afterEach(() => {
    trap.stop();
    trap.state.sequenceNumber = 0;
  });

  test('API provides valid header metadata getter functions', () => {
    expect(trap.sessionId()).toMatch(/^[-0-9a-f]{36}$/);
    expect(trap.streamId()).toMatch(/^[-0-9a-f]{36}$/);
  });

  test('GenerateNewStreamId generates new valid streamId', () => {
    const originalStreamId = trap.streamId();

    trap.generateNewStreamId();

    expect(trap.streamId()).toMatch(/^[-0-9a-f]{36}$/);
    expect(trap.streamId()).not.toEqual(originalStreamId);
  });

  test('sends header message', () => {
    // Send a simple custom message -- this message ensures that something will
    // be sent over the wire
    trap.send('message');

    // Manually invoke submit
    trap.submit();

    // Fetch "fetch body" and parse its JSON
    const jsonBody = JSON.parse(fetch.mock.calls[0][1].body);

    // Get metadata message
    const headers = jsonBody.filter((e) => e[0] === HEADER_MESSAGE_TYPE);

    // Check number of metadata messages in the stream
    expect(headers).toHaveLength(1);

    // Check first event's third argument -- which is an object
    expect(headers[0]).toMatchObject([
      HEADER_MESSAGE_TYPE, // message type
      expect.any(Number), // current timestamp
      expect.stringMatching(/^[-0-9a-f]{36}$/), // sessionId
      expect.stringMatching(/^[-0-9a-f]{36}$/), // streamId
      expect.any(Number), // sequenceNumber
      expect.objectContaining({ // schema
        version: expect.any(String), // schema version
      }),
    ]);
  });

  test('checks consistent sequence number', () => {
    // Send a simple custom message -- this message ensures that something will
    // be sent over the wire
    trap.send('message1');

    // Manually invoke submit
    trap.submit();

    // Fetch message sent and save sequence number to check against the next
    // message
    const firstSequenceNumber = JSON.parse(fetch.mock.calls[0][1].body)
      .filter((e) => e[0] === HEADER_MESSAGE_TYPE)[0][4];

    // Send a next message
    trap.send('message2');

    // Manually invoke submit
    trap.submit();

    // Fetch SQ# from second message
    const secondSequenceNumber = JSON.parse(fetch.mock.calls[1][1].body)
      .filter((e) => e[0] === HEADER_MESSAGE_TYPE)[0][4];

    // Assertion
    expect(firstSequenceNumber).toBe(0);
    expect(secondSequenceNumber).toEqual(firstSequenceNumber + 1);
  });
});
