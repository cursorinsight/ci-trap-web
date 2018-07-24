import CITrap from './../src/index';

var ciTrap = new CITrap();

window.onload = () => {
  var startButton = document.getElementById('start');
  var stopButton = document.getElementById('stop');
  var showButton = document.getElementById('show');
  var bufferDiv = document.getElementById('buffer');

  startButton.addEventListener('click', () => {
    ciTrap.start();
  });

  stopButton.addEventListener('click', () => {
    ciTrap.stop();
  });

  showButton.addEventListener('click', () => {
    bufferDiv.innerHTML = ciTrap.buffer();
  });
};
