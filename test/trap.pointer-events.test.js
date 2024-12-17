import '@testing-library/jest-dom';
import { fireEvent, createEvent } from '@testing-library/dom';
import fetch, { disableFetchMocks, enableFetchMocks } from 'jest-fetch-mock';

import trap from '../src/trap';
import { MOUSE_MOVE_MESSAGE_TYPE } from '../src/constants';

const initialHtml = '<html><head></head><body>some text</body></html>';

const pointerEventCtorProps = [
  'screenX',
  'screenY',
  'buttons',
  'coalescedEvents',
  'pointerId',
  'pointerType',
];

class PointerEventFake extends Event {
  constructor(type, props) {
    super(type, props);
    pointerEventCtorProps.forEach((prop) => {
      if (props[prop] != null) {
        this[prop] = props[prop];
      }
    });
  }

  getCoalescedEvents() {
    if (this.coalescedEvents) {
      return this.coalescedEvents;
    }
    return [this];
  }
}

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
    window.PointerEvent = PointerEventFake;

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
        expect.objectContaining({ capture: true, passive: true }),
      ),
    );

    documentAddELSpy.mockRestore();
  });

  it.each(['mouse', 'touch'])('triggers pointer move events', (pointerType) => {
    // Set up fetch() mocks
    fetch.mockResponse(() => Promise.resolve({ result: 'ok' }));

    const { body } = document;

    fireEvent.pointerMove(body, {
      bubbles: true,
      cancelable: true,
      pointerType,
      pointerId: 1,
      screenX: 1,
      screenY: 2,
    });

    fireEvent.pointerMove(body, {
      bubbles: true,
      cancelable: true,
      pointerType,
      pointerId: 1,
      screenX: 3,
      screenY: 4,
    });

    // Manually trigger submit
    trap.submit();

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  function fireCoalescedEvent() {
    const { body } = document;

    const evt1Dict = {
      bubbles: true,
      cancelable: true,
      pointerType: 'mouse',
      screenX: 1,
      screenY: 2,
      buttons: 0,
    };

    const evt2Dict = {
      bubbles: true,
      cancelable: true,
      pointerType: 'mouse',
      screenX: 3,
      screenY: 4,
      buttons: 0,
    };

    const evt1 = createEvent.pointerMove(
      body,
      new PointerEventFake('pointermove', evt1Dict),
    );
    const evt2 = createEvent.pointerMove(
      body,
      new PointerEventFake('pointermove', evt2Dict),
    );

    fireEvent.pointerMove(
      body,
      new PointerEventFake('pointermove', {
        ...evt2Dict,
        coalescedEvents: [evt1, evt2],
      }),
    );
  }

  test('triggers coalesced pointer move event and capture it', () => {
    // Configure trap to capture coalesced events
    trap.setCaptureCoalescedEvents(true);

    // Create and fire the event
    fireCoalescedEvent();

    // Manually trigger submit
    trap.submit();

    expect(fetch).toHaveBeenCalledTimes(1);

    // Fetch "fetch body" and parse its JSON
    const jsonBody = JSON.parse(fetch.mock.calls[0][1].body);

    // Filter pointer(mouse) move events
    const moveEvents = jsonBody
      .filter((e) => e[0] === MOUSE_MOVE_MESSAGE_TYPE);

    expect(moveEvents).toHaveLength(2);

    expect(moveEvents[0])
      .toMatchObject([
        MOUSE_MOVE_MESSAGE_TYPE,
        expect.any(Number),
        1,
        2,
        0,
        1,
      ]);

    expect(moveEvents[1])
      .toMatchObject([
        MOUSE_MOVE_MESSAGE_TYPE,
        expect.any(Number),
        3,
        4,
        0,
        0,
      ]);
  });

  test('triggers coalesced pointer move event and do not capture them', () => {
    // Configure trap to avoid capturing coalesced events
    trap.setCaptureCoalescedEvents(false);

    // Create and fire the event
    fireCoalescedEvent();

    // Manually trigger submit
    trap.submit();

    expect(fetch).toHaveBeenCalledTimes(1);

    // Fetch "fetch body" and parse its JSON
    const jsonBody = JSON.parse(fetch.mock.calls[0][1].body);

    // Filter pointer(mouse) move events
    const moveEvents = jsonBody
      .filter((e) => e[0] === MOUSE_MOVE_MESSAGE_TYPE);

    expect(moveEvents).toHaveLength(1);

    expect(moveEvents[0])
      .toMatchObject([
        MOUSE_MOVE_MESSAGE_TYPE,
        expect.any(Number),
        3,
        4,
        0,
        0,
      ]);
  });

  it.each(['mouse', 'touch'])(
    'triggers pointer down and up events',
    (pointerType) => {
      const { body } = document;

      fireEvent.pointerDown(body, {
        bubbles: true,
        cancelable: true,
        pointerType,
        pointerId: 1,
        button: 0,
        buttons: 1,
        screenX: 1,
        screenY: 2,
      });

      fireEvent.pointerUp(body, {
        bubbles: true,
        cancelable: true,
        pointerType,
        pointerId: 1,
        button: 0,
        buttons: 0,
        screenX: 3,
        screenY: 4,
      });

      // Manually trigger submit
      trap.submit();

      expect(fetch).toHaveBeenCalledTimes(1);
    },
  );

  test('do not capture pen events', () => {
    // Set up fetch() mocks
    fetch.mockResponse(() => Promise.resolve({ result: 'ok' }));

    const { body } = document;

    fireEvent.pointerDown(body, {
      bubbles: true,
      cancelable: true,
      pointerType: 'pen',
      pointerId: 1,
      screenX: 1,
      screenY: 2,
    });

    fireEvent.pointerMove(body, {
      bubbles: true,
      cancelable: true,
      pointerType: 'pen',
      pointerId: 1,
      screenX: 3,
      screenY: 4,
    });

    fireEvent.pointerUp(body, {
      bubbles: true,
      cancelable: true,
      pointerType: 'pen',
      pointerId: 1,
      screenX: 5,
      screenY: 6,
    });

    // Manually trigger submit
    trap.submit();

    expect(fetch).toHaveBeenCalledTimes(0);
  });

  test('unregisters event handlers by unmounting Trap from document', () => {
    const documentRemoveELSpy = jest.spyOn(document, 'removeEventListener');

    // Unmount Trap from `document`
    trap.umount(document);

    ['pointermove', 'pointerdown', 'pointerup'].forEach(
      (event) => expect(document.removeEventListener).toHaveBeenCalledWith(
        event,
        expect.any(Function),
        expect.objectContaining({ capture: true, passive: true }),
      ),
    );

    documentRemoveELSpy.mockRestore();
  });
});
