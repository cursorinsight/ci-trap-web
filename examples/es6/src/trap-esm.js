import trap from 'ci-trap-web';
import './style.css';

// Mount Trap's event listener and disable touch events
const testElement = document.getElementById('testElement');
trap.mount(testElement);
trap.disableTouchEvents(testElement);

// Set up logging
trap.setLogDestination('log');

// Set up API key
trap.apiKeyName('example-api-key-name');
trap.apiKeyValue('example-api-key-value');

// Enclose submit features into a function
function setUpTrapSubmit() {
  // Convenience methods
  var copyTrapUrl = function() {
    trap.url(document.getElementById('trapUrl').value);
  }

  // Set up URL settings
  document.getElementById('trapSetUrl')
    .addEventListener('click', function(e) {
      copyTrapUrl();
    });

  // Submit button
  document.getElementById('trapSubmit')
    .addEventListener('click', function(e) {
      trap.submit().then(results => {
        trap.log(results);
      });
    });

  // Set up Trap defaults by copying `trapUrl`'s value
  copyTrapUrl();

  // Start/stop buttons
  document.getElementById('trapStart')
    .addEventListener('click', function(e) {
      trap.start();
    });
  document.getElementById('trapStop')
    .addEventListener('click', function(e) {
      trap.stop();
    });
}

// Apply submit features to existing form elements
setUpTrapSubmit();

// Set custom metadata
trap.addCustomMetadata('foo', 'bar');
