import { JSDOM } from 'jsdom';
import '@testing-library/jest-dom';
import { getByText } from '@testing-library/dom';

describe('snippet', () => {
  const initialHtml = `
<html>
  <head>
    <script>
      (function(g,r,a,b,o,x,y){g[o]=g[o]||function(){(g[o]
      .q=g[o].q||[]).push(arguments)},g[o].t=1*new Date();
      x=r.createElement(a),y=r.getElementsByTagName(a)[0];
      x.async=1;x.src=b;y.parentNode.insertBefore(x,y)})(
      window,document,'script','gt.min.js','gt');
      gt('apiKeyName', 'example-api-key');
    </script>
  </head>
  <body>
    <p>some text</p>
    <a href="/index.html">Link to this page</a>
    <a href="https://cursorinsight.com">Cursor Insight</a>
  </body>
</html>
`;

  let document;
  let window;

  beforeAll(() => {
    window = new JSDOM(initialHtml, { runScripts: 'dangerously' }).window;
    document = window.document;

    // Here you must use `jest.resetModules` because otherwise Jest will have
    // cached `trap.js` and it will _not_ run again.
    jest.resetModules();
  });

  test('snippet HTML is loaded', () => {
    expect(getByText(document, /some text/i)).toBeInTheDocument();
  });

  test('Tracker code is set to be loaded', () => {
    expect(document.documentElement)
      .toContainHTML('<script src="gt.min.js" />');
  });
});
