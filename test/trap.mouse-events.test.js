import '@testing-library/jest-dom';
import { fireEvent } from '@testing-library/dom';
import fetch, { disableFetchMocks, enableFetchMocks } from 'jest-fetch-mock';

import trap from '../src/trap';

const initialHtml = '<html><head></head><body>some text</body></html>';

describe('browser with mouse events', () => {
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

    ['mousemove', 'mousedown', 'mouseup'].forEach(
      (event) => expect(document.addEventListener).toHaveBeenCalledWith(
        event,
        expect.any(Function),
      ),
    );

    documentAddELSpy.mockRestore();
  });

  test('triggers mouse move events', () => {
    const { body } = document;

    fireEvent.mouseMove(body, {
      bubbles: true,
      cancelable: true,
      screenX: 1,
      screenY: 2,
    });

    fireEvent.mouseMove(body, {
      bubbles: true,
      cancelable: true,
      screenX: 3,
      screenY: 4,
    });

    // Two, not yet submitted events
    expect(trap.eventCount()).toBe(2);

    // Manually trigger submit
    trap.submit();

    // Two submitted events
    expect(trap.eventCount()).toBe(2);

    expect(fetch).toHaveBeenCalledTimes(1);

    fireEvent.mouseMove(body, {
      bubbles: true,
      cancelable: true,
      screenX: 5,
      screenY: 6,
    });

    // Two submitted, one not submitted event
    expect(trap.eventCount()).toBe(3);

    // Manually trigger submit
    trap.submit(true);

    // Four submitted (3 mouse + 1 header)
    expect(trap.eventCount()).toBe(4);

    // Resets event count
    trap.resetEventCount();

    // Event count reseted
    expect(trap.eventCount()).toBe(0);
  });

  test('triggers mouse down and up events', () => {
    const { body } = document;

    fireEvent.mouseDown(body, {
      bubbles: true,
      cancelable: true,
      button: 0,
      buttons: 1,
      screenX: 1,
      screenY: 2,
    });

    fireEvent.mouseUp(body, {
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

    ['mousemove', 'mousedown', 'mouseup'].forEach(
      (event) => expect(document.removeEventListener).toHaveBeenCalledWith(
        event,
        expect.any(Function),
      ),
    );

    documentRemoveELSpy.mockRestore();
  });
});
