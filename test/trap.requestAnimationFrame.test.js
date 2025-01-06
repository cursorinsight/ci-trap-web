import '@testing-library/jest-dom';
import fetch, { disableFetchMocks, enableFetchMocks } from 'jest-fetch-mock';

import trap from '../src/trap';
import { REQUEST_ANIMATION_FRAME_MESSAGE_TYPE } from '../src/constants';

const initialHtml = '<html><head></head><body>some text</body></html>';

// requestAnimationFrame frequency (in Hz)
const RAF_FREQUENCY = 60;
// Interval between two requestAnimationFrame messages in ms.
const RAF_MESSAGE_INTERVAL = 1000 / RAF_FREQUENCY;

describe('browser with requestAnimationFrame callbacks', () => {
  beforeAll(() => {
    document.body.innerHTML = initialHtml;

    // Here you must use `jest.resetModules` because otherwise Jest will have
    // cached `trap.js` and it will _not_ run again.
    jest.resetModules();

    // Use fake timers -- it means that timers must be advanced manually!
    jest.useFakeTimers();

    // Enable fetch() mocks
    enableFetchMocks();

    // Set up fetch() mocks
    fetch.mockResponse(() => Promise.resolve({ result: 'ok' }));
  });

  beforeEach(() => {
    let count = 0;
    // Mock requestAnimationFrame
    jest.spyOn(window, 'requestAnimationFrame')
      .mockImplementation((callback) => {
        count += 1;
        setTimeout(
          () => callback(count * RAF_MESSAGE_INTERVAL),
          RAF_MESSAGE_INTERVAL,
        );
        return count;
      });

    // Mock cancelAnimationFrame
    jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
  });

  afterAll(() => {
    // Disable fetch() mocks
    disableFetchMocks();

    // Use real timers from now on
    jest.useRealTimers();
  });

  afterEach(() => {
    // Restore requestAnimationFrame mock
    window.requestAnimationFrame.mockRestore();
    // Restore cancelAnimationFrame mock
    window.cancelAnimationFrame.mockRestore();
  });

  test('Capture requestAnimationFrame messages', async () => {
    trap.setCaptureRequestAnimationFrame(true);

    // Advance timers for two request animation frame callbacks
    // (more than 2 intervals and less than 3)
    jest.advanceTimersByTime(2.5 * RAF_MESSAGE_INTERVAL);

    // Manually trigger submit
    await trap.submit();

    expect(fetch).toHaveBeenCalledTimes(1);

    // Fetch "fetch body" and parse its JSON
    const jsonBody = JSON.parse(fetch.mock.calls[0][1].body);

    // Filter pointer(mouse) move events
    const moveEvents = jsonBody
      .filter((e) => e[0] === REQUEST_ANIMATION_FRAME_MESSAGE_TYPE);

    expect(moveEvents).toHaveLength(2);
  });

  test('Stopping data collection should cancel animation frame', () => {
    // Start capturing events
    trap.setCaptureRequestAnimationFrame(true);

    // Stop data collection
    trap.stop();

    expect(window.cancelAnimationFrame).toHaveBeenCalledTimes(1);
  });

  test(
    'Start data collection should request animation frame if enabled',
    () => {
      // Start capturing events
      trap.setCaptureRequestAnimationFrame(true);

      // Clear the requestAnimationFrame mock call count
      window.requestAnimationFrame.mockClear();

      // Stop data collection
      trap.stop();

      // Restart data collection
      trap.start();

      expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1);
    },
  );

  test(
    'Start and stop collection should when requestAnimationFrame is disabled',
    () => {
      // Start capturing events
      trap.setCaptureRequestAnimationFrame(false);

      // Clear the cancelAnimationFrame mock call count
      window.cancelAnimationFrame.mockClear();

      // Stop data collection
      trap.stop();

      // Restart data collection
      trap.start();

      expect(window.requestAnimationFrame).not.toHaveBeenCalled();
      expect(window.cancelAnimationFrame).not.toHaveBeenCalled();
    },
  );

  test(
    'Enable and disable captureRequestAnimationFrame',
    () => {
      // Enable event collection
      trap.setCaptureRequestAnimationFrame(true);

      // Disable event collection
      trap.setCaptureRequestAnimationFrame(false);

      expect(window.cancelAnimationFrame).toHaveBeenCalledTimes(1);
    },
  );
});
