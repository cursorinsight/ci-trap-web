import '@testing-library/jest-dom';
import { fireEvent } from '@testing-library/dom';
import fetch, { disableFetchMocks, enableFetchMocks } from 'jest-fetch-mock';

import trap from '../src/trap';

const initialHtml = '<html><head></head><body>some text</body></html>';

// Change `TOUCH_ENABLED` to `true`
jest.mock('../src/constants', () => {
  const originalModule = jest.requireActual('../src/constants');

  return {
    __esModule: true,
    ...originalModule,
    TOUCH_ENABLED: true,
  };
});

describe('browser with touch events', () => {
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

  test('registers event handlers by mounting Trap to document', () => {
    const documentAddELSpy = jest.spyOn(document, 'addEventListener');

    // Load Trap and mount it into the `document`
    trap.mount(document);

    ['touchmove', 'touchstart', 'touchend'].forEach(
      (event) => expect(document.addEventListener).toHaveBeenCalledWith(
        event,
        expect.any(Function),
        expect.objectContaining({ capture: true, passive: true }),
      ),
    );

    documentAddELSpy.mockRestore();
  });

  test('triggers touch events', () => {
    // Set up fetch() mocks
    fetch.mockResponse(() => Promise.resolve({ result: 'ok' }));

    const { body } = document;

    fireEvent.touchStart(body, {
      bubbles: true,
      cancelable: true,
      changedTouches: [{
        identifier: 123,
        screenX: 1,
        screenY: 2,
      }],
    });

    fireEvent.touchMove(body, {
      bubbles: true,
      cancelable: true,
      changedTouches: [{
        identifier: 123,
        screenX: 3,
        screenY: 4,
      }],
    });

    fireEvent.touchEnd(body, {
      bubbles: true,
      cancelable: true,
      changedTouches: [{
        identifier: 123,
        screenX: 5,
        screenY: 6,
      }],
    });

    // Manually trigger submit
    trap.submit();

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  test('unregisters event handlers by unmounting Trap from document', () => {
    const documentRemoveELSpy = jest.spyOn(document, 'removeEventListener');

    // Unmount Trap from `document`
    trap.umount(document);

    ['touchmove', 'touchstart', 'touchend'].forEach(
      (event) => expect(document.removeEventListener).toHaveBeenCalledWith(
        event,
        expect.any(Function),
        expect.objectContaining({ capture: true, passive: true }),
      ),
    );

    documentRemoveELSpy.mockRestore();
  });

  const { body } = document;

  test('disables touch events, including zooming and panning', () => {
    // Mount Trap to `document`
    trap.mount(document);

    // Disable touch events
    trap.disableTouchEvents(body);

    // Check results
    expect(body.style.touchAction).toBe('none');
  });

  test('restores original touch events', () => {
    // Restore original touch events
    trap.restoreTouchEvents(body);

    // Check results
    expect(body.style.touchAction).not.toBe('none');

    // Umount Trap
    trap.umount(document);
  });
});
