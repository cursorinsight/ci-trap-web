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

  test('registers event handlers by mounting Trap to anything', () => {
    const windowAddELSpy = jest.spyOn(window, 'addEventListener');

    // Load Trap and mount it into the `document`
    trap.mount(document);

    // Expect to register a handler for `wheel` events
    expect(window.addEventListener).toHaveBeenCalledWith(
      'scroll',
      expect.any(Function),
    );

    windowAddELSpy.mockRestore();
  });

  test('triggers wheel events', () => {
    const { body } = document;

    fireEvent.scroll(body, {
      bubbles: true,
      cancelable: true,
    });

    // Manually trigger submit
    trap.submit();

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  test('unregisters event handlers by unmounting Trap entirely', () => {
    const windowRemoveELSpy = jest.spyOn(window, 'removeEventListener');

    // Unmount Trap from `document`
    trap.umount(document);

    expect(window.removeEventListener).toHaveBeenCalledWith(
      'scroll',
      expect.any(Function),
    );

    windowRemoveELSpy.mockRestore();
  });
});
