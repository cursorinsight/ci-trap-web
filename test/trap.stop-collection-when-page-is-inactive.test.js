import '@testing-library/jest-dom';
import { fireEvent } from '@testing-library/dom';
import fetch, { disableFetchMocks, enableFetchMocks } from 'jest-fetch-mock';

import trap from '../src/trap';

const initialHtml = '<html><head></head><body>some text</body></html>';

describe('stop data collection when page becomes inactive', () => {
  beforeAll(() => {
    document.body.innerHTML = initialHtml;

    // Here you must use `jest.resetModules` because otherwise Jest will have
    // cached `trap.js` and it will _not_ run again.
    jest.resetModules();

    // Use fake timers -- it means that timers must be advanced manually!
    jest.useFakeTimers();

    // Enable fetch() mocks
    enableFetchMocks();
  });

  afterAll(() => {
    // Disable fetch() mocks
    disableFetchMocks();
  });

  beforeEach(() => {
    // Load Trap and mount it into the `document`
    trap.mount(document);
    trap.stop();
    trap.start();
  });

  test('Stop data collection on page hide', async () => {
    trap.stopDataCollectionOnPageHide(true);

    // Trigger blur event
    fireEvent.blur(window, {});

    // Automatic submission on blur
    expect(fetch).toHaveBeenCalledTimes(1);
    // HeaderEvent, MetadataEvent, BlurEvent
    const messages = JSON.parse(fetch.mock.calls[0][1].body);
    expect(messages).toHaveLength(3);

    jest.clearAllMocks();
    // Advance more than the metadata submission interval (1 minute)
    jest.advanceTimersByTime(70_000);

    // No data should be submitted
    expect(fetch).not.toHaveBeenCalled();

    // Trigger focus event
    fireEvent.focus(window, {});

    // Submit data and check results
    await trap.submit();

    // Check automatic submission
    expect(fetch).toHaveBeenCalledTimes(1);

    const newMessages = JSON.parse(fetch.mock.calls[0][1].body);
    // HeaderEvent, MetadataEvent, FocusEvent
    expect(newMessages).toHaveLength(3);
  });

  test(
    'Page is hidden and stopDataCollectionOnPageHide is disabled',
    async () => {
      trap.stopDataCollectionOnPageHide(false);

      // Trigger blur event
      fireEvent.blur(window, {});

      // Automatic submission on blur
      expect(fetch).toHaveBeenCalledTimes(1);

      // HeaderEvent, MetadataEvent, BlurEvent
      const messages = JSON.parse(fetch.mock.calls[0][1].body);
      expect(messages).toHaveLength(3);

      jest.clearAllMocks();
      // Advance more than the metadata submission interval (1 minute)
      jest.advanceTimersByTime(70_000);
      // No data should be submitted
      expect(fetch).toHaveBeenCalledTimes(0);
      jest.clearAllMocks();

      // Trigger focus event
      fireEvent.focus(window, {});

      // Submit data and check results
      await trap.submit();

      // Check automatic submission
      expect(fetch).toHaveBeenCalledTimes(1);

      const newMessages = JSON.parse(fetch.mock.calls[0][1].body);
      // HeaderEvent, MetadataEvent and FocusEvent
      expect(newMessages).toHaveLength(3);
    },
  );
});
