import '@testing-library/jest-dom';

import trap from '../src/trap';

import {
  CUSTOM_MESSAGE_TYPE,
  HEADER_MESSAGE_TYPE,
} from '../src/constants';

const initialHtml = '<html><head></head><body>some text</body></html>';

describe('In-memory buffer tests', () => {
  beforeAll(async () => {
    document.body.innerHTML = initialHtml;

    // Here you must use `jest.resetModules` because otherwise Jest will have
    // cached `trap.js` and it will _not_ run again.
    jest.resetModules();

    // Use fake timers -- it means that timers must be advanced manually!
    jest.useFakeTimers();

    // Load Trap and mount it into the `document`
    trap.mount(document);

    // Set up fetch() mocks
    trap.setTransportMethod('dummy');

    // Start data collection and submission
    trap.start();
    // Do a submission to make the test deterministic
    await trap.submit();
  });

  afterAll(() => {
    // Use real timers from now on
    jest.useRealTimers();
  });

  test('In memory event collection enabled test', async () => {
    // Enable event collection
    trap.setCollectEvents(true);

    // Send a simple custom message
    trap.send('message');

    // Manually invoke chunk submission
    await trap.submit();

    // Two submitted events
    expect(trap.collectedEvents()).toHaveLength(2);

    // One submitted custom event
    expect(trap.collectedEvents().filter((item) => item[0] === 1))
      .toHaveLength(1);

    // Expect the collectedEvents to be a clone of the collected data
    const evts = trap.collectedEvents();
    // Change the event type of the first event
    const FAKE_EVENT_TYPE = -123;
    evts[0][0] = FAKE_EVENT_TYPE;
    expect(trap.collectedEvents()[0][0]).not.toBe(FAKE_EVENT_TYPE);

    // Get the collected events in the in-memory buffer
    const collectedEvents = trap.flushCollectedEvents();

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

  test('In memory event collection disabled test', async () => {
    // Disable event collection
    trap.setCollectEvents(false);

    // Send a simple custom message
    trap.send('message');

    // Manually invoke chunk submission
    await trap.submit();

    // Get the collected events in the in-memory buffer
    const collectedEvents = trap.flushCollectedEvents();

    // Ensure no data was captured in the in memory buffer
    expect(collectedEvents).toHaveLength(0);
  });

  test('Buffer size limit', async () => {
    // Enable / disable event collection
    trap.setCollectEvents(true);

    // Set a small buffer size
    trap.setEventCollectionSizeLimit(4);

    // Send a simple custom message
    trap.send('message1');
    trap.send('message2');
    await trap.submit();

    trap.send('message3');
    trap.send('message4');
    await trap.submit();

    // Manually invoke chunk submission
    trap.send('message5');
    trap.send('message6');
    await trap.submit();

    // Get the collected events in the in-memory buffer
    const collectedEvents = trap.flushCollectedEvents();
    expect(collectedEvents).toHaveLength(3);

    // First message is header
    expect(collectedEvents[0][0]).toEqual(HEADER_MESSAGE_TYPE);

    // Other messages are custom messages
    expect(collectedEvents[1]).toMatchObject([
      CUSTOM_MESSAGE_TYPE,
      expect.any(Number),
      expect.objectContaining({
        message: 'message5',
      }),
    ]);

    expect(collectedEvents[2]).toMatchObject([
      CUSTOM_MESSAGE_TYPE,
      expect.any(Number),
      expect.objectContaining({
        message: 'message6',
      }),
    ]);
  });
});
