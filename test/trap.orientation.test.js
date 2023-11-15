import '@testing-library/jest-dom';
import fetch, { disableFetchMocks, enableFetchMocks } from 'jest-fetch-mock';

import { METADATA_MESSAGE_TYPE } from '../src/constants';
import trap from '../src/trap';

const initialHtml = '<html><head></head><body>some text</body></html>';

describe('screen orientation handlers', () => {
  beforeAll(() => {
    document.body.innerHTML = initialHtml;

    // Here you must use `jest.resetModules` because otherwise Jest will have
    // cached `trap.js` and it will _not_ run again.
    jest.resetModules();

    // Enable fetch() mocks
    enableFetchMocks();

    // Load Trap and mount it into the `document`
    trap.mount(document);

    // Set up fetch() mocks
    fetch.mockResponse(() => Promise.resolve({ result: 'ok' }));
  });

  afterAll(() => {
    // Disable fetch() mocks
    disableFetchMocks();
  });

  afterEach(() => {
    trap.stop();
  });

  // Metadata events are composed of the followings:
  //
  // * event type (which equals to 11),
  // * event t
  const ANGLE_KEY = '2.screen.orientation.angle';
  const TYPE_KEY = '2.screen.orientation.type';

  test('simulates portrait orientation', () => {
    // Set `window.orientation` to `0` (portrait)
    const originalWindowOrientation = window.orientation;
    window.orientation = 0;

    // Start periodic metadata
    trap.start();

    // Send a simple custom message
    trap.send('message');

    // Manually invoke chunk submission
    trap.submit();

    // Fetch "fetch body" and parse its JSON
    const jsonBody = JSON.parse(fetch.mock.calls[0][1].body);

    // Select first metadata event
    const metadata = jsonBody.filter((e) => e[0] === METADATA_MESSAGE_TYPE)[0];

    // Check body
    expect(metadata).toHaveProperty(ANGLE_KEY, 0);
    expect(metadata).toHaveProperty(TYPE_KEY, 'portrait');

    // Restore `window.orientation`
    window.orientation = originalWindowOrientation;
  });

  test('simulates landscape orientation', () => {
    // Set `window.orientation` to `90` (landscape)
    const originalWindowOrientation = window.orientation;
    window.orientation = 90;

    // Start periodic metadata
    trap.start();

    // Send a simple custom message
    trap.send('message');

    // Manually invoke chunk submission
    trap.submit();

    // Fetch "fetch body" and parse its JSON
    const jsonBody = JSON.parse(fetch.mock.calls[0][1].body);

    // Select first metadata event
    const metadata = jsonBody.filter((e) => e[0] === METADATA_MESSAGE_TYPE)[0];

    // Check body
    expect(metadata).toHaveProperty(ANGLE_KEY, 90);
    expect(metadata).toHaveProperty(TYPE_KEY, 'landscape');

    // Restore `window.orientation`
    window.orientation = originalWindowOrientation;
  });

  test('simulates inverted landscape orientation', () => {
    // Set `window.orientation` to `-90` (inverted landscape)
    const originalWindowOrientation = window.orientation;
    window.orientation = -90;

    // Start periodic metadata
    trap.start();

    // Send a simple custom message
    trap.send('message');

    // Manually invoke chunk submission
    trap.submit();

    // Fetch "fetch body" and parse its JSON
    const jsonBody = JSON.parse(fetch.mock.calls[0][1].body);

    // Select first metadata event
    const metadata = jsonBody.filter((e) => e[0] === METADATA_MESSAGE_TYPE)[0];

    // Check body
    expect(metadata).toHaveProperty(ANGLE_KEY, -90);
    expect(metadata).toHaveProperty(TYPE_KEY, 'landscape');

    // Restore `window.orientation`
    window.orientation = originalWindowOrientation;
  });

  test('simulates custom orientation', () => {
    // Set `window.screen.orientation` to `42`
    const originalWindowScreenOrientation = window.screen.orientation;
    window.screen.orientation = { type: 'custom-tilted', angle: 42 };

    // Start periodic metadata
    trap.start();

    // Send a simple custom message
    trap.send('message');

    // Manually invoke chunk submission
    trap.submit();

    // Fetch "fetch body" and parse its JSON
    const jsonBody = JSON.parse(fetch.mock.calls[0][1].body);

    // Select first metadata event
    const metadata = jsonBody.filter((e) => e[0] === METADATA_MESSAGE_TYPE)[0];

    // Check body
    expect(metadata).toHaveProperty(ANGLE_KEY, 42);
    expect(metadata).toHaveProperty(TYPE_KEY, 'custom-tilted');

    // Restore `window.orientation`
    window.screen.orientation = originalWindowScreenOrientation;
  });

  test('disables orientation support', () => {
    // Unset related values
    window.screen.orientation = undefined;
    window.orientation = undefined;

    // Start periodic metadata
    trap.start();

    // Send a simple custom message
    trap.send('message');

    // Manually invoke chunk submission
    trap.submit();

    // Fetch "fetch body" and parse its JSON
    const jsonBody = JSON.parse(fetch.mock.calls[0][1].body);

    // Select first metadata event
    const metadata = jsonBody.filter((e) => e[0] === METADATA_MESSAGE_TYPE)[0];

    // TODO: review this value -- or remove it from the parent entirely
    // check body
    expect(metadata).toHaveProperty('2.screen.orientation', {});
  });
});
