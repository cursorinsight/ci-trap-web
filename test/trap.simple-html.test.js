import '@testing-library/jest-dom';
import { screen } from '@testing-library/dom';

const initialHtml = '<html><head></head><body>some text</body></html>';

describe('simple HTML', () => {
  beforeAll(() => {
    document.body.innerHTML = initialHtml;

    // Here you must use `jest.resetModules` because otherwise Jest will have
    // cached `trap.js` and it will _not_ run again.
    jest.resetModules();
  });

  test('example HTML is loaded', () => {
    expect(screen.getByText(/some text/i)).toBeInTheDocument();
  });
});
