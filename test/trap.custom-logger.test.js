import '@testing-library/jest-dom';
import { disableFetchMocks, enableFetchMocks } from 'jest-fetch-mock';

import trap from '../src/trap';

const initialHtml = `
<html>
  <head>
  </head>
  <body>
    <div id="logger">
    </div>
  </body>
</html>`;

describe('custom logger', () => {
  beforeAll(() => {
    document.body.innerHTML = initialHtml;

    // Here you must use `jest.resetModules` because otherwise Jest will have
    // cached `trap.js` and it will _not_ run again.
    jest.resetModules();

    // Enable fetch() mocks
    enableFetchMocks();

    // Load Trap and mount it into the `document`
    trap.mount(document);
  });

  afterAll(() => {
    // Disable fetch() mocks
    disableFetchMocks();
  });

  test('logs a custom message', () => {
    // spy on `console.log()` which is the default logger destination
    const consoleLogSpy = jest.spyOn(console, 'log');

    // Manually invoke chunk submission
    trap.log('custom', 'log', 'message', { with: 'object' });

    // Expect a single chunk to be submitted with the actual custom log message
    // serialized into the body.
    expect(consoleLogSpy).toHaveBeenCalledWith(
      'custom',
      'log',
      'message',
      { with: 'object' },
    );

    // Restore original console.log()
    consoleLogSpy.mockRestore();
  });

  test('sets logger to a custom element', () => {
    // Set up a custom log destination
    trap.setLogDestination('logger');

    // Manually invoke chunk submission
    trap.log('custom', 'log', 'message', { with: 'object' });

    // Check results
    const loggerDiv = document.getElementById('logger');
    expect(loggerDiv.innerHTML).toMatch(/custom,log,message/);
  });

  test('resets logger to its default', () => {
    // spy on `console.log()` which is the default logger destination
    const consoleLogSpy = jest.spyOn(console, 'log');

    // Reset logger to its default: `console.log()`
    trap.setLogDestination();

    // Manually invoke chunk submission
    trap.log('custom', 'log', 'message', { with: 'object' });

    // Expect a single chunk to be submitted with the actual custom log message
    // serialized into the body.
    expect(consoleLogSpy).toHaveBeenCalledWith(
      'custom',
      'log',
      'message',
      { with: 'object' },
    );

    // Restore original console.log()
    consoleLogSpy.mockRestore();
  });
});
