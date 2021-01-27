import '@testing-library/jest-dom';
import { disableFetchMocks, enableFetchMocks } from 'jest-fetch-mock';

import trap from '../src/trap';

const initialHtml = '<html><head></head><body>some text</body></html>';

// Change `VISIBILITY_CHANGE_ENABLED` to `false`
jest.mock('../src/constants', () => {
  const originalModule = jest.requireActual('../src/constants');

  return {
    __esModule: true,
    ...originalModule,
    VISIBILITY_CHANGE_ENABLED: false,
  };
});

describe('disabled document visibility change', () => {
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

  test('registers pagehide event', () => {
    const documentAddELSpy = jest.spyOn(document, 'addEventListener');
    const windowAddELSpy = jest.spyOn(window, 'addEventListener');

    // Load Trap and mount it into the `document`
    trap.mount(document);

    // Check for `pagehide` event registrations instead of `visibilitychange`
    expect(document.addEventListener).not.toHaveBeenCalledWith(
      'visibilityChange',
      expect.any(Function),
    );

    expect(window.addEventListener).toHaveBeenCalledWith(
      'pagehide',
      expect.any(Function),
    );

    windowAddELSpy.mockRestore();
    documentAddELSpy.mockRestore();
  });

  test('unregisters pagehide event', () => {
    const documentRemoveELSpy = jest.spyOn(document, 'removeEventListener');
    const windowRemoveELSpy = jest.spyOn(window, 'removeEventListener');

    // Load Trap and mount it into the `document`
    trap.umount(document);

    // Check for `pagehide` event registrations instead of `visibilitychange`
    expect(document.removeEventListener).not.toHaveBeenCalledWith(
      'visibilityChange',
      expect.any(Function),
    );

    expect(window.removeEventListener).toHaveBeenCalledWith(
      'pagehide',
      expect.any(Function),
    );

    windowRemoveELSpy.mockRestore();
    documentRemoveELSpy.mockRestore();
  });
});
