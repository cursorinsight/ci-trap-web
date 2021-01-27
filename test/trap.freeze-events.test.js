import '@testing-library/jest-dom';
import { disableFetchMocks, enableFetchMocks } from 'jest-fetch-mock';

import trap from '../src/trap';

const initialHtml = '<html><head></head><body>some text</body></html>';

// Change `FREEZE_ENABLED` to `true`
jest.mock('../src/constants', () => {
  const originalModule = jest.requireActual('../src/constants');

  return {
    __esModule: true,
    ...originalModule,
    FREEZE_ENABLED: true,
  };
});

describe('manually enabled freeze event handlers', () => {
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

  test('registers freeze event handler', () => {
    const documentAddELSpy = jest.spyOn(document, 'addEventListener');

    // Load Trap and mount it into the `document`
    trap.mount(document);

    // Check for `freeze` event registrations
    expect(document.addEventListener).toHaveBeenCalledWith(
      'freeze',
      expect.any(Function),
    );

    documentAddELSpy.mockRestore();
  });

  // This test case is a CONTINUATION
  test('unregisters freeze event handler', () => {
    const documentRemoveELSpy = jest.spyOn(document, 'removeEventListener');

    // Load Trap and mount it into the `document`
    trap.umount(document);

    // Check for unregistering `freeze` events
    expect(document.removeEventListener).toHaveBeenCalledWith(
      'freeze',
      expect.any(Function),
    );

    documentRemoveELSpy.mockRestore();
  });
});
