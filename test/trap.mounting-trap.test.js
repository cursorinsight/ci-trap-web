import '@testing-library/jest-dom';
import { disableFetchMocks, enableFetchMocks } from 'jest-fetch-mock';

import trap from '../src/trap';

const initialHtml = `
<html>
  <head></head>
  <body>
    <div id="a">some</div>
    <div id="b">text</div>
  </body>
</html>`;

describe('mounting Trap', () => {
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

  test('mounts Trap once to document', () => {
    const addEventListenerSpy = jest.spyOn(document, 'addEventListener');

    // Load Trap and mount it into the `document`
    trap.mount(document);

    // Expect `addEventListener` calls are made 5 times
    expect(document.addEventListener).toHaveBeenCalledTimes(5);

    addEventListenerSpy.mockRestore();
  });

  // This is a CONTINUATION test case
  test('unmounts Trap from document', () => {
    const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');

    // Unmount Trap
    trap.umount(document);

    // Expect 5 `removeEventListener` calls
    expect(document.removeEventListener).toHaveBeenCalledTimes(5);

    removeEventListenerSpy.mockRestore();
  });

  test('mounts Trap twice to document', () => {
    const addEventListenerSpy = jest.spyOn(document, 'addEventListener');

    // Load Trap and mount it into the `document`
    trap.mount(document);

    // Expect 5 addEventListener calls when mouse handlers are active
    expect(document.addEventListener).toHaveBeenCalledTimes(5);

    // Clear mock to start with a clean slate
    addEventListenerSpy.mockClear();

    // Mount again
    trap.mount(document);

    // Expect no more addEventListener calls
    expect(document.addEventListener).not.toHaveBeenCalled();

    addEventListenerSpy.mockRestore();
  });

  // This is a CONTINUATION test case
  test('unmounts Trap twice', () => {
    const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');

    // Unmount Trap
    trap.umount(document);

    // Expect 5 `removeEventListener` calls
    expect(document.removeEventListener).toHaveBeenCalledTimes(5);

    // Clear mock to start with a clean slate
    removeEventListenerSpy.mockClear();

    // Umount again
    trap.umount(document);

    // Expect no more addEventListener calls
    expect(document.removeEventListener).not.toHaveBeenCalled();

    removeEventListenerSpy.mockRestore();
  });

  test('mounts and unmounts Trap to different elements', () => {
    const divA = document.getElementById('a');
    const divB = document.getElementById('b');

    const globalAddELSpy = jest.spyOn(document, 'addEventListener');
    const globalRemoveELSpy = jest.spyOn(document, 'removeEventListener');

    const divAAddELSpy = jest.spyOn(divA, 'addEventListener');
    const divARemoveELSpy = jest.spyOn(divA, 'removeEventListener');
    const divBAddELSpy = jest.spyOn(divB, 'addEventListener');
    const divBRemoveELSpy = jest.spyOn(divB, 'removeEventListener');

    // Load Trap to both `div`'s
    trap.mount(divA);
    trap.mount(divB);

    // Expect 1+4+4 addEventListener calls
    expect(document.addEventListener).toHaveBeenCalledTimes(1);
    expect(divA.addEventListener).toHaveBeenCalledTimes(4);
    expect(divB.addEventListener).toHaveBeenCalledTimes(4);

    // Clear mock to start with a clean slate
    globalAddELSpy.mockClear();
    divAAddELSpy.mockClear();
    divBAddELSpy.mockClear();

    // Mount again
    trap.mount(divA);
    trap.mount(divB);

    // Expect no more addEventListener calls
    expect(document.addEventListener).not.toHaveBeenCalled();
    expect(divA.addEventListener).not.toHaveBeenCalled();
    expect(divB.addEventListener).not.toHaveBeenCalled();

    // Umount Trap
    trap.umount(divA);
    trap.umount(divB);

    // Expect 1+4+4 `removeEventListener` calls
    expect(document.removeEventListener).toHaveBeenCalledTimes(1);
    expect(divA.removeEventListener).toHaveBeenCalledTimes(4);
    expect(divB.removeEventListener).toHaveBeenCalledTimes(4);

    // Clear mock to start with a clean slate
    globalRemoveELSpy.mockClear();
    divARemoveELSpy.mockClear();
    divBRemoveELSpy.mockClear();

    // Umount Trap
    trap.umount(divA);
    trap.umount(divB);

    // Expect no more addEventListener calls
    expect(document.removeEventListener).not.toHaveBeenCalled();
    expect(divA.removeEventListener).not.toHaveBeenCalled();
    expect(divB.removeEventListener).not.toHaveBeenCalled();

    globalAddELSpy.mockRestore();
    globalRemoveELSpy.mockRestore();
    divAAddELSpy.mockRestore();
    divARemoveELSpy.mockRestore();
    divBAddELSpy.mockRestore();
    divBRemoveELSpy.mockRestore();
  });
});
