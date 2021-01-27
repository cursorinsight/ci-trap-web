const fs = require('fs');
const path = require('path');

module.exports = {
  printMessage: (originalMessage, decodedMessage) => {
    // Print header with some eye candy
    console.log(`${Array(process.stdout.columns || 81).join('-')}\nMessage `
      + `(transmitted: ${originalMessage.length}, `
      + `JS object: ${decodedMessage.length}, `
      + (100.0 * originalMessage.length / decodedMessage.length).toFixed(2)
      + `%):`);

    // Print message content
    console.log(decodedMessage);
  },

  writeMessage: (dataDirectory, buffer) => {
      // Save data into the specified directory -- if specified
      if (dataDirectory) {
        fs.mkdirSync(dataDirectory, { recursive: true });
        const filename = path.resolve(dataDirectory, `${Date.now()}.json`);
        fs.appendFile(filename, buffer, (err) => {
          if (err) {
            console.log(`Write error:`, err);
          } else {
            console.log(`=> ${buffer.length} bytes written to ${filename}`);
          }
        });
      }
  },
}
