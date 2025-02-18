import '@testing-library/jest-dom';
import fetch, { disableFetchMocks, enableFetchMocks } from 'jest-fetch-mock';

import {
  METADATA_MESSAGE_TYPE,
  DEFAULT_METADATA_SUBMISSION_INTERVAL,
  DEFAULT_TRAP_INACTIVE_TIMEOUT,
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
  });

  afterEach(() => {
    trap.stop();
    trap.setMetadataSubmissionInterval(DEFAULT_METADATA_SUBMISSION_INTERVAL);
  });

  test('sends metadata message', async () => {
    trap.start();
    // Send a simple custom message -- this message ensures that something will
    // be sent over the wire
    trap.send('message');

    // Manually invoke submit
    await trap.submit();

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

  test('sends metadata message only once in a minute', async () => {
    trap.start();
    // Send two messages in two separate submissions.
    trap.send('message1');
    await trap.submit();
    trap.send('message2');
    await trap.submit();

    // advance time by 1 millisecond less than the inactive timeout to avoid
    // the inactive timer's effect
    jest.advanceTimersByTime(DEFAULT_TRAP_INACTIVE_TIMEOUT - 1);
    trap.send('message3.1');
    // advance time by 1 millisecond less than 1 minute in total
    jest.advanceTimersByTime(
      DEFAULT_METADATA_SUBMISSION_INTERVAL - DEFAULT_TRAP_INACTIVE_TIMEOUT,
    );
    trap.send('message3.2');
    await trap.submit();

    // advance time by 1 millisecond -- which expires the internal timer
    jest.advanceTimersByTime(1);
    trap.send('message4');
    await trap.submit();

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

  test('sends metadata manually as well', async () => {
    trap.start();
    // Send two messages in two separate submissions.
    trap.send('message1');
    await trap.submit();

    trap.send('message2');
    trap.submitMetadata();
    await trap.submit();

    // Fetch "fetch bodies" and parse their JSON
    const jsonBody1 = JSON.parse(fetch.mock.calls[0][1].body);
    const metadata1 = jsonBody1.filter((e) => e[0] === METADATA_MESSAGE_TYPE);
    const jsonBody2 = JSON.parse(fetch.mock.calls[1][1].body);
    const metadata2 = jsonBody2.filter((e) => e[0] === METADATA_MESSAGE_TYPE);

    // Check number of metadata messages in the stream
    expect(metadata1).toHaveLength(1);
    expect(metadata2).toHaveLength(1);
  });

  test('set custom metadata submission interval', async () => {
    trap.start();
    const SUBMISSION_INTERVAL = 1000;
    trap.setMetadataSubmissionInterval(SUBMISSION_INTERVAL);
    trap.inactiveTimeout(SUBMISSION_INTERVAL - 2);

    // Send two messages in two separate submissions.
    trap.send('message1');
    await trap.submit();
    trap.send('message2');
    await trap.submit();

    // Send some data in the meantime to avoid the inactive timeout
    jest.advanceTimersByTime(SUBMISSION_INTERVAL / 2);
    trap.send('message3.1');
    jest.advanceTimersByTime(SUBMISSION_INTERVAL / 2 - 1);
    trap.send('message3.2');
    await trap.submit();

    // Previous three submits performed submissions
    expect(fetch.mock.calls).toHaveLength(3);

    // advance time by 1 millisecond -- which expires the internal timer
    jest.advanceTimersByTime(1);
    await trap.submit();
    // Metadata event is added and submitted
    expect(fetch.mock.calls).toHaveLength(4);

    jest.advanceTimersByTime(SUBMISSION_INTERVAL * 2);
    await trap.submit();
    // Do not submit a metadataevent if Trap is inactive
    // (no other data is submitted)
    expect(fetch.mock.calls).toHaveLength(4);

    // Send a different message type and a new metadata event should also be
    // sent.
    trap.send('message4');
    await trap.submit();

    // Fetch "fetch bodies" and parse their JSON
    const jsonBody1 = JSON.parse(fetch.mock.calls[0][1].body);
    const metadata1 = jsonBody1.filter((e) => e[0] === METADATA_MESSAGE_TYPE);
    const jsonBody2 = JSON.parse(fetch.mock.calls[1][1].body);
    const metadata2 = jsonBody2.filter((e) => e[0] === METADATA_MESSAGE_TYPE);
    const jsonBody3 = JSON.parse(fetch.mock.calls[2][1].body);
    const metadata3 = jsonBody3.filter((e) => e[0] === METADATA_MESSAGE_TYPE);
    const jsonBody4 = JSON.parse(fetch.mock.calls[3][1].body);
    const metadata4 = jsonBody4.filter((e) => e[0] === METADATA_MESSAGE_TYPE);
    const jsonBody5 = JSON.parse(fetch.mock.calls[4][1].body);
    const metadata5 = jsonBody5.filter((e) => e[0] === METADATA_MESSAGE_TYPE);

    // Check number of metadata messages in the stream
    expect(metadata1).toHaveLength(1);
    expect(metadata2).toHaveLength(0);
    expect(metadata3).toHaveLength(0);
    expect(metadata4).toHaveLength(1);
    expect(metadata5).toHaveLength(1);
  });

  test('collectUrls enabled test', async () => {
    // Enable URL collection
    trap.setMetadataCollectUrls(true);
    trap.start();

    trap.send('message');
    await trap.submit();

    // Fetch "fetch body" and parse its JSON
    const jsonBody = JSON.parse(fetch.mock.calls[0][1].body);
    const metadata = jsonBody.filter((e) => e[0] === METADATA_MESSAGE_TYPE);

    // Check number of metadata messages in the stream
    expect(metadata).toHaveLength(1);

    expect(metadata[0])
      .toEqual([
        METADATA_MESSAGE_TYPE,
        expect.any(Number),
        expect.objectContaining({
          location: expect.objectContaining({
            current: expect.any(String),
            previous: expect.any(String),
          }),
        }),
      ]);
  });

  test('collectUrls disabled test', async () => {
    // Disable URL collection
    trap.setMetadataCollectUrls(false);
    trap.start();

    trap.send('message');
    await trap.submit();

    // Fetch "fetch body" and parse its JSON
    const jsonBody = JSON.parse(fetch.mock.calls[0][1].body);
    const metadata = jsonBody.filter((e) => e[0] === METADATA_MESSAGE_TYPE);

    // Check number of metadata messages in the stream
    expect(metadata).toHaveLength(1);

    expect(metadata[0])
      .toEqual([
        METADATA_MESSAGE_TYPE,
        expect.any(Number),
        expect.objectContaining({
          location: expect.not.objectContaining({
            current: expect.any(String),
            previous: expect.any(String),
          }),
        }),
      ]);
  });
});
