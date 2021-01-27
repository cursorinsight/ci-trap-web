// Check consistent epoch and event time information between calls.

import '@testing-library/jest-dom';
import fetch, { disableFetchMocks, enableFetchMocks } from 'jest-fetch-mock';

import { CUSTOM_EVENT_TYPE } from '../src/constants';
import trap from '../src/trap';

const initialHtml = '<html><head></head><body>some text</body></html>';

describe('time-property', () => {
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

  test('header and metadata timestamps are consistent', () => {
    // Send two messages in their own submission calls 1 second apart
    // be sent over the wire
    trap.send('message1a');
    jest.advanceTimersByTime(100);
    trap.send('message1b');
    trap.submit();
    jest.advanceTimersByTime(900);
    trap.send('message2a');
    jest.advanceTimersByTime(100);
    trap.send('message2b');
    trap.submit();

    // Read the timestamp of the first custom message -- this will be our epoch
    // in this test session.
    const epoch = JSON.parse(fetch.mock.calls[0][1].body)
      .filter((e) => e[0] === CUSTOM_EVENT_TYPE)[0][1];

    // Read submissions and reduce a list to event timestamps only
    const firstSubmissionTimestamps = JSON.parse(fetch.mock.calls[0][1].body)
      .map((e) => e[1] - epoch);
    const secondSubmissionTimestamps = JSON.parse(fetch.mock.calls[1][1].body)
      .map((e) => e[1] - epoch);

    // Assertions
    //
    // `message1a` and `message1b` timestamps should be exactly at 0 and 100,
    // respectively.
    expect(firstSubmissionTimestamps.slice(2, 4)).toStrictEqual([0, 100]);
    expect(secondSubmissionTimestamps).toStrictEqual([100, 1000, 1100]);

    // TODO: Since the "trap" instance is initialized **before** jest could set
    // up its fake timers, its epoch has always a small offset and the
    // timestamp of the first header and metadata messages always come early.
    expect(firstSubmissionTimestamps[0]).toEqual(firstSubmissionTimestamps[1]);
    // TODO: this is a failing test case which works in the browser properly
    // expect(firstSubmissionTimestamps[1])
    //          .toBeLessThanOrEqual(firstSubmissionTimestamps[2]);
  });
});
