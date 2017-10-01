# ci-trap

`ci-trap` is a lightweight mouse movement tracker library for browsers.

## Getting Started

### Installation

Clone the project and enjoy.
```
$ git clone https://github.com/cursorinsight/ci-trap
```

### Usage

This solution collects motion events on an HTML element (by default on a
document), serializes these events and sends them to a sinking server. The
project uses a custom format, which is described at the top of the
ci-trap/src/ci-trap.js file.

```javascript
var CITrap = require(".../ci-trap/src/ci-trap");

var ciTrap = new CITrap();

ciTrap.start(); // start collecting events

ciTrap.stop(); // stop collecting

ciTrap.buffer(); // return the currently serialized events

ciTrap.send(); // send serialized data to the `<host>/s` URL (the URL can be changed)
```

To push custom events / information to the buffer:
```javascript
ciTrap.mark("custom information");
```

To set custom sinking URL:
```javascript
ciTrap.setUrl(`<custom url>`);
```

### Example

The `/examples` directory contains a working mini-application that demonstrates
ci-trap's core functions. After installing the required dependencies, the
project defines several gulp tasks for your convenience:

- You may (re)bundle the mini-app with ci-trap's code using:

  ```
  ./node_modules/.bin/gulp scripts
  ```

- You may start a listener task that serves compiled and static example content:

  ```
  ./node_modules/.bin/gulp serve
  ```

  ...which will be accessible at: [localhost:8100](http://localhost:8100/)

For an example tracker application, please check
[ci-tracker](https://github.com/cursorinsight/ci-tracker).

## Development

### Prerequisites

You need [node](https://nodejs.org) (>=4.0.0) and [npm](https://www.npmjs.com)
(>=3.0.0) for development.

### Installation

Install dependencies with [NPM](https://www.npmjs.org):

```
npm install
```

### Testing

For unit and browser testing:

```
./node_modules/.bin/gulp test
```

For linting:

```
./node_modules/.bin/gulp check
```

## License

`ci-trap` is released under the [MIT license](https://github.com/cursorinsight/ci-trap/blob/master/LICENSE.md).
