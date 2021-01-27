import React from 'react';
import logo from './logo.svg';
import './App.css';

import trap from 'ci-trap';

// Set up Trap
trap.apiKey('example-api-key');
trap.url('/set-up-trap-server-url-here');

// To set up Trap for the entire document, instead of a single element,
// leave your application as it is and uncomment the following line only:
//trap.mount(document.body);

class App extends React.Component {
  constructor(props) {
    super(props);
    this.ref = React.createRef();
  }

  componentDidMount() {
    trap.mount(this.ref.current);
  }

  componentWillUmount() {
    trap.umount(this.ref.current);
  }

  render() {
    return (
      <div className="App" ref={this.ref}>
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Trap is successfully installed on this page.
            For details, see <code>examples/react/src/App.js</code>.
          </p>
        </header>
      </div>
    );
  }
}

export default App;
