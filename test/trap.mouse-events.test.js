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
        expect.objectContaining({ capture: true, passive: true }),
      ),
    );

    documentAddELSpy.mockRestore();
  });

  test('triggers mouse move events', async () => {
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
    expect(trap.collectedEvents()).toHaveLength(2);
    expect(trap.collectedEventCount()).toBe(2);

    // Two mouse events
    expect(trap.collectedEvents().filter((item) => item[0] === 0))
      .toHaveLength(2);
    expect(trap.collectedEventCount((item) => item[0] === 0)).toBe(2);

    // No custom event
    expect(trap.collectedEvents().filter((item) => item[0] === 1))
      .toHaveLength(0);

    // Manually trigger submit
    await trap.submit();

    // Submitted events are not counted
    expect(trap.collectedEvents()).toHaveLength(0);

    expect(fetch).toHaveBeenCalledTimes(1);

    fireEvent.mouseMove(body, {
      bubbles: true,
      cancelable: true,
      screenX: 5,
      screenY: 6,
    });

    // One not submitted event
    expect(trap.collectedEvents()).toHaveLength(1);

    // Manually trigger submit
    trap.submit(true);

    // Four submitted (3 mouse + 1 header)
    expect(trap.collectedEvents()).toHaveLength(0);
  });

  test('triggers mouse down and up events', async () => {
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
    await trap.submit();

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
        expect.objectContaining({ capture: true, passive: true }),
      ),
    );

    documentRemoveELSpy.mockRestore();
  });
});
