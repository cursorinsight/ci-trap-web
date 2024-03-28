import trap from 'ci-trap-web';
import './style.css';

// Mount Trap's event listener and disable touch events
const testElement = document.getElementById('testElement');
trap.mount(testElement);
trap.disableTouchEvents(testElement);

// Set up logging
trap.setLogDestination('log');

// Set up API key
trap.apiKey('example-api-key');

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
}

// Apply submit features to existing form elements
setUpTrapSubmit();

// Set custom metadata
trap.metadata('foo', 'bar');
