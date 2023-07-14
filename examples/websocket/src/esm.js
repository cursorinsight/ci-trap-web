import trap from 'ci-trap';
import './style.css';

// Mount Trap's event listener and disable touch events
const testElement = document.getElementById('testElement');
trap.mount(testElement);
trap.disableTouchEvents(testElement);

// Set up logging
trap.setLogDestination('log');

// Set up API key
trap.apiKey('example-api-key');

// Convenience methods
var copyTrapUrl = function() {
  trap.url(document.getElementById('trapUrl').value);
}

// Enclose submit features into a function
function setUpTrapSubmit() {

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
trap.metadata('foo', 'bar');

// Set up WS transport
trap.setUseWsTransport(true);

copyTrapUrl();
