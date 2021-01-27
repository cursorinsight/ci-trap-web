import '@testing-library/jest-dom';
import { fireEvent } from '@testing-library/dom';
import fetch, { disableFetchMocks, enableFetchMocks } from 'jest-fetch-mock';

import trap from '../src/trap';

const initialHtml = '<html><head></head><body>some text</body></html>';

describe('browser with wheel events', () => {
  beforeAll(() => {
    document.body.innerHTML = initialHtml;

    // Here you must use `jest.resetModules` because otherwise Jest will have
    // cached `trap.js` and it will _not_ run again.
    jest.resetModules();

    // Enable fetch() mocks
    enableFetchMocks();

    // Set up fetch() mocks
    fetch.mockResponse(() => Promise.resolve({ result: 'ok' }));
  });

  afterAll(() => {
    // Disable fetch() mocks
    disableFetchMocks();
  });

  test('registers event handlers by mounting Trap to document', () => {
    const documentAddELSpy = jest.spyOn(document, 'addEventListener');

    // Load Trap and mount it into the `document`
    trap.mount(document);

    // Expect to register a handler for `wheel` events
    expect(document.addEventListener).toHaveBeenCalledWith(
      'wheel',
      expect.any(Function),
    );

    documentAddELSpy.mockRestore();
  });

  test('triggers wheel events', () => {
    const { body } = document;

    fireEvent.wheel(body, {
      bubbles: true,
      cancelable: true,
      deltaX: 1,
      deltaY: 2,
      deltaZ: 3,
      deltaMode: 0,
    });

    // Manually trigger submit
    trap.submit();

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  test('unregisters event handlers by unmounting Trap from document', () => {
    const documentRemoveELSpy = jest.spyOn(document, 'removeEventListener');

    // Unmount Trap from `document`
    trap.umount(document);

    expect(document.removeEventListener).toHaveBeenCalledWith(
      'wheel',
      expect.any(Function),
    );

    documentRemoveELSpy.mockRestore();
  });
});
