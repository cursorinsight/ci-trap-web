import WS from 'jest-websocket-mock';

import trap from '../src/trap';

import {
  CUSTOM_MESSAGE_TYPE,
  HEADER_MESSAGE_TYPE,
  METADATA_MESSAGE_TYPE,

} from '../src/constants';

const initialHtml = '<html><head></head><body>some text</body></html>';
const fakeUrl = 'ws://localhost:3002';

describe('metadata', () => {
  const commonSetup = async (message) => {
    const url = `${fakeUrl}/${trap.sessionId()}/${trap.streamId()}`;
    const mockServer = new WS(url);

    // Send a simple custom message -- this message ensures that something
    // will be sent over the wire
    trap.send(message ?? 'message');

    // Manually invoke submit
    await trap.submit();

    return mockServer;
  };

  beforeAll(() => {
    document.body.innerHTML = initialHtml;

    // Here you must use `jest.resetModules` because otherwise Jest will have
    // cached `trap.js` and it will _not_ run again.
    jest.resetModules();

    // Load Trap and mount it into the `document`
    trap.mount(document);
  });

  afterAll(() => {
    trap.setUseWsTransport(false);
  });

  beforeEach(async () => {
    trap.setUseWsTransport(true);
    trap.url(`${fakeUrl}/\${sessionId}/\${streamId}`);
  });

  afterEach(() => {
    // Close all connections
    WS.clean();
  });

  test('if server is running message is sent', async () => {
    const mockServer = await commonSetup();

    // Get the first message the server received and parse its JSON
    const message = await mockServer.nextMessage;
    const jsonBody = JSON.parse(message);

    expect(jsonBody).toHaveLength(3);

    // First message is header
    expect(jsonBody[0][0]).toEqual(HEADER_MESSAGE_TYPE);

    // Second message is metaData
    expect(jsonBody[1][0]).toEqual(METADATA_MESSAGE_TYPE);

    // Third message is the custom event
    expect(jsonBody[2]).toMatchObject([
      CUSTOM_MESSAGE_TYPE,
      expect.any(Number),
      expect.objectContaining({
        message: 'message',
      }),
    ]);
  });

  test('changing to HTTP transport closes connection', async () => {
    const mockServer = await commonSetup();

    trap.setUseWsTransport(false);

    await expect(mockServer.closed).resolves.toBeUndefined();
  });

  test('changing the URL closes connection', async () => {
    const mockServer = await commonSetup();

    trap.url('ws://localhost:3003/');

    await expect(mockServer.closed).resolves.toBeUndefined();
  });

  test('http protocol is also handled', async () => {
    const url = `${fakeUrl}/${trap.sessionId()}/${trap.streamId()}`;
    const mockServer = new WS(url);

    // eslint-disable-next-line no-template-curly-in-string
    trap.url('http://localhost:3002/${sessionId}/${streamId}');

    // Send a simple custom message -- this message ensures that something
    // will be sent over the wire
    trap.send('message');

    // Manually invoke submit
    await trap.submit();

    // Despite the http url the client should connect to the server with ws url
    await expect(mockServer.connected).resolves.toBeTruthy();
  });

  test.each([
    [true],
    [false],
  ])('When the connection closes the client reconnects', async (error) => {
    let mockServer = await commonSetup();

    if (error) {
      mockServer.error();
    } else {
      mockServer.close();
    }

    mockServer = await commonSetup('message2');

    // Get the first message the server received and parse its JSON
    const message = await mockServer.nextMessage;
    const jsonBody = JSON.parse(message);

    expect(jsonBody).toHaveLength(2);

    // First message is header
    expect(jsonBody[0][0]).toEqual(HEADER_MESSAGE_TYPE);

    // Second message is the custom event
    expect(jsonBody[1]).toMatchObject([
      CUSTOM_MESSAGE_TYPE,
      expect.any(Number),
      expect.objectContaining({
        message: 'message2',
      }),
    ]);
  });
});
