import '@testing-library/jest-dom';
import fetch, { disableFetchMocks, enableFetchMocks } from 'jest-fetch-mock';

import {
  METADATA_MESSAGE_TYPE,
  DEFAULT_METADATA_SUBMISSION_INTERVAL,
} from '../src/constants';
import trap from '../src/trap';

const initialHtml = '<html><head></head><body>some text</body></html>';

describe('metadata', () => {
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

    // Reset trap instance -- to make it sure that HTTP resends metadata
    // messages
    trap.reset();
  });

  test('sends metadata message', () => {
    // Send a simple custom message -- this message ensures that something will
    // be sent over the wire
    trap.send('message');

    // Manually invoke submit
    trap.submit();

    // Fetch "fetch body" and parse its JSON
    const jsonBody = JSON.parse(fetch.mock.calls[0][1].body);

    // Get metadata message
    const metadata = jsonBody.filter((e) => e[0] === METADATA_MESSAGE_TYPE);

    // Check number of metadata messages in the stream
    expect(metadata).toHaveLength(1);

    // Check first event's third argument -- which is an object
    expect(metadata[0]).toMatchObject([
      METADATA_MESSAGE_TYPE,
      expect.any(Number),
      expect.objectContaining({
        platform: expect.any(Object),
        location: expect.any(Object),
        custom: expect.any(Object),
        screen: expect.any(Object),
        document: expect.any(Object),
      }),
    ]);
  });

  test('sends metadata message only once in a minute', () => {
    // Send two messages in two separate submissions.
    trap.send('message1');
    trap.submit();
    trap.send('message2');
    trap.submit();

    // advance time by exactly 1 minute
    jest.advanceTimersByTime(DEFAULT_METADATA_SUBMISSION_INTERVAL);
    trap.send('message3');
    trap.submit();

    // advance time by 1 microsecond -- which expires the internal timer
    jest.advanceTimersByTime(1);
    trap.send('message4');
    trap.submit();

    // Fetch "fetch bodies" and parse their JSON
    const jsonBody1 = JSON.parse(fetch.mock.calls[0][1].body);
    const metadata1 = jsonBody1.filter((e) => e[0] === METADATA_MESSAGE_TYPE);
    const jsonBody2 = JSON.parse(fetch.mock.calls[1][1].body);
    const metadata2 = jsonBody2.filter((e) => e[0] === METADATA_MESSAGE_TYPE);
    const jsonBody3 = JSON.parse(fetch.mock.calls[2][1].body);
    const metadata3 = jsonBody3.filter((e) => e[0] === METADATA_MESSAGE_TYPE);
    const jsonBody4 = JSON.parse(fetch.mock.calls[3][1].body);
    const metadata4 = jsonBody4.filter((e) => e[0] === METADATA_MESSAGE_TYPE);

    // Check number of metadata messages in the stream
    expect(metadata1).toHaveLength(1);
    expect(metadata2).toHaveLength(0);
    expect(metadata3).toHaveLength(0);
    expect(metadata4).toHaveLength(1);
  });
});
