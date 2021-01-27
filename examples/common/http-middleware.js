const { strFromU8, unzlibSync } = require('fflate');
const { printMessage, writeMessage } = require('./utils');

module.exports = (options) => {
  const dataDirectory = options?.dataDirectory;

  return (req, res, next) => {
    // POST requests only!
    if (req.method !== 'POST') {
      return next();
    }

    // Match 'encoding' special argument in 'Content-Type' header; default is
    // JSON
    const encoding =
      (req.get('Content-Type').match(/encoding=([^\s]*)/) || [])[1] || 'json';

    // Parse request body
    const buffer = ({
      'json': () => Buffer.from(req.body).toString(),
      'json+zlib': () => strFromU8(unzlibSync(Buffer.from(req.body))),
    }[encoding])();

    // Print message and write to file if `dataDirectory` is specified
    printMessage(req.body, buffer);
    writeMessage(dataDirectory, buffer);

    // Send response with CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.json({ response: 'ok' });
  };
};
