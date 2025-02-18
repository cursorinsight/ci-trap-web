import '@testing-library/jest-dom';
import { fireEvent } from '@testing-library/dom';
import fetch, { disableFetchMocks, enableFetchMocks } from 'jest-fetch-mock';

import {
  BLUR_WINDOW_MESSAGE_TYPE,
  FOCUS_WINDOW_MESSAGE_TYPE,
} from '../src/constants';
import trap from '../src/trap';

const initialHtml = '<html><head></head><body>some text</body></html>';

describe('blur event handlers', () => {
  beforeAll(() => {
    document.body.innerHTML = initialHtml;

    // Here you must use `jest.resetModules` because otherwise Jest will have
    // cached `trap.js` and it will _not_ run again.
    jest.resetModules();

    // Enable fetch() mocks
    enableFetchMocks();
  });

  afterAll(() => {
    // Disable fetch() mocks
    disableFetchMocks();
  });

  test('registers blur event handler', () => {
    const windowAddELSpy = jest.spyOn(window, 'addEventListener');

    // Load Trap and mount it into the `document`
    trap.mount(document);

    // Check for `blur` and `focus` event registrations
    ['blur', 'focus'].forEach((eventName) => {
      expect(window.addEventListener).toHaveBeenCalledWith(
        eventName,
        expect.any(Function),
      );
    });

    windowAddELSpy.mockRestore();
  });

  test('triggers blur events', () => {
    // Trigger blur event
    fireEvent.blur(window, {});

    // Check automatic submission
    expect(fetch).toHaveBeenCalled();

    // Check registered blur event
    // Check registered focus event
    const message = JSON.parse(fetch.mock.calls[0][1].body)
      .filter((e) => e[0] === BLUR_WINDOW_MESSAGE_TYPE)[0];

    expect(message)
      .toMatchObject([
        BLUR_WINDOW_MESSAGE_TYPE,
        expect.any(Number),
        expect.any(Object),
      ]);
  });

  test('registers focus event', async () => {
    // Trigger focus event -- trap registers it as an event
    fireEvent.focus(window, {});

    // Submit data and check results
    await trap.submit();

    // Check registered focus event
    const message = JSON.parse(fetch.mock.calls[0][1].body)
      .filter((e) => e[0] === FOCUS_WINDOW_MESSAGE_TYPE)[0];

    expect(message)
      .toMatchObject([
        FOCUS_WINDOW_MESSAGE_TYPE,
        expect.any(Number),
        expect.any(Object),
      ]);
  });

  // This test case is a CONTINUATION
  test('unregisters freeze event handler', () => {
    const windowRemoveELSpy = jest.spyOn(window, 'removeEventListener');

    // Load Trap and mount it into the `document`
    trap.umount(document);

    // Check for `blur` and `focus` event registrations
    ['blur', 'focus'].forEach((eventName) => {
      expect(window.removeEventListener).toHaveBeenCalledWith(
        eventName,
        expect.any(Function),
      );
    });

    windowRemoveELSpy.mockRestore();
  });
});
