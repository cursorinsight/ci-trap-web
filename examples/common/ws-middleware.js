const ws = require('ws');
const url = require('url');
const { printMessage, writeMessage } = require('./utils');

// Export handles the HTTP->WS upgrade on a Node.js HTTP server instance
module.exports = (options) => {
  const dataDirectory = options?.dataDirectory;
  const wsServer = new ws.Server({
    noServer: true
  });

  wsServer.on('connection', (socket) => {
    socket.on('message', (message) => {
      printMessage(message,  message.toString('utf8'));
      writeMessage(dataDirectory, message);
    });
  });

  return (request, socket, head) => {
    if (url.parse(request.url).pathname.startsWith('/api/1/ws')) {
      wsServer.handleUpgrade(request, socket, head, function done(ws) {
        wsServer.emit('connection', ws, request);
      });
    }
  };
}
