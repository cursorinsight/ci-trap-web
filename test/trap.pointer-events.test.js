import '@testing-library/jest-dom';
import { fireEvent } from '@testing-library/dom';
import fetch, { disableFetchMocks, enableFetchMocks } from 'jest-fetch-mock';

import trap from '../src/trap';

const initialHtml = '<html><head></head><body>some text</body></html>';

// Change `POINTER_ENABLED` to `true`
jest.mock('../src/constants', () => {
  const originalModule = jest.requireActual('../src/constants');

  return {
    __esModule: true,
    ...originalModule,
    POINTER_ENABLED: true,
  };
});

describe('browser with pointer events', () => {
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

    ['pointermove', 'pointerdown', 'pointerup'].forEach(
      (event) => expect(document.addEventListener).toHaveBeenCalledWith(
        event,
        expect.any(Function),
      ),
    );

    documentAddELSpy.mockRestore();
  });

  test('triggers pointer move events', () => {
    // Set up fetch() mocks
    fetch.mockResponse(() => Promise.resolve({ result: 'ok' }));

    const { body } = document;

    fireEvent.pointerMove(body, {
      bubbles: true,
      cancelable: true,
      screenX: 1,
      screenY: 2,
    });

    fireEvent.pointerMove(body, {
      bubbles: true,
      cancelable: true,
      screenX: 3,
      screenY: 4,
    });

    // Manually trigger submit
    trap.submit();

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  test('triggers pointer down and up events', () => {
    const { body } = document;

    fireEvent.pointerDown(body, {
      bubbles: true,
      cancelable: true,
      button: 0,
      buttons: 1,
      screenX: 1,
      screenY: 2,
    });

    fireEvent.pointerUp(body, {
      bubbles: true,
      cancelable: true,
      button: 0,
      buttons: 0,
      screenX: 3,
      screenY: 4,
    });

    // Manually trigger submit
    trap.submit();

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  test('unregisters event handlers by unmounting Trap from document', () => {
    const documentRemoveELSpy = jest.spyOn(document, 'removeEventListener');

    // Unmount Trap from `document`
    trap.umount(document);

    ['pointermove', 'pointerdown', 'pointerup'].forEach(
      (event) => expect(document.removeEventListener).toHaveBeenCalledWith(
        event,
        expect.any(Function),
      ),
    );

    documentRemoveELSpy.mockRestore();
  });
});
