import '@testing-library/jest-dom';
import { disableFetchMocks, enableFetchMocks } from 'jest-fetch-mock';

import trap from '../src/trap';
import {
  CUSTOM_MESSAGE_TYPE,
  HEADER_MESSAGE_TYPE,
} from '../src/constants';

const initialHtml = '<html><head></head><body>some text</body></html>';

describe('On data submitted tests', () => {
  beforeAll(() => {
    document.body.innerHTML = initialHtml;

    // Here you must use `jest.resetModules` because otherwise Jest will have
    // cached `trap.js` and it will _not_ run again.
    jest.resetModules();

    // Use fake timers -- it means that timers must be advanced manually!
    jest.useFakeTimers();

    // Enable fetch mocks
    enableFetchMocks();

    // Load Trap and mount it into the `document`
    trap.mount(document);

    // Set up fetch() mocks
    trap.setTransportMethod('dummy');

    // Start data collection and submission
    trap.start();
    // Do a submission to make the test deterministic
    trap.submit();
  });

  afterAll(() => {
    // Use real timers from now on
    jest.useRealTimers();

    // Disable fetch mocks
    disableFetchMocks();
  });

  test('On data submitted enabled test', () => {
    const collectedEvents = [];

    // Add onDataSubmitted handler
    trap.onDataSubmitted((data) => collectedEvents.push(...data));

    // Send a simple custom message
    trap.send('message');

    // Manually invoke chunk submission
    trap.submit();

    // Ensure data was captured in the in memory buffer
    expect(collectedEvents).toHaveLength(2);

    // First message is header
    expect(collectedEvents[0][0]).toEqual(HEADER_MESSAGE_TYPE);

    // Third message is the custom event
    expect(collectedEvents[1]).toMatchObject([
      CUSTOM_MESSAGE_TYPE,
      expect.any(Number),
      expect.objectContaining({
        message: 'message',
      }),
    ]);
  });

  test('On data submitted disabled test', () => {
    const collectedEvents = [];

    // Add onDataSubmitted handler
    trap.onDataSubmitted((data) => collectedEvents.push(...data));

    // Disable onDataSubmitted
    trap.onDataSubmitted(undefined);

    // Send a simple custom message
    trap.send('message');

    // Manually invoke chunk submission
    trap.submit();

    // Ensure no data was captured in the in memory buffer
    expect(collectedEvents).toHaveLength(0);
  });

  test('Multiple submission test', async () => {
    const collectedEvents = [];

    // Add onDataSubmitted handler
    trap.onDataSubmitted((data) => collectedEvents.push(...data));

    // Send messages with multiple submissions
    trap.send('message1');
    trap.send('message2');
    trap.submit();

    trap.send('message3');
    trap.send('message4');
    trap.submit();

    expect(collectedEvents).toHaveLength(6);
  });

  test('Transport method change test', async () => {
    const collectedEvents = [];

    // Add onDataSubmitted handler
    trap.onDataSubmitted((data) => collectedEvents.push(...data));

    // Change transport method
    trap.setTransportMethod('http');

    // Send message and request manual submission
    trap.send('message');
    trap.submit();

    expect(collectedEvents).toHaveLength(2);
  });
});
