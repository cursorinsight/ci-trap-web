# ci-trap

`ci-trap` is a lightweight mouse movement tracker library for browsers.

## Getting Started

### Installation

Clone the project and enjoy.
```
$ git clone https://github.com/cursorinsight/ci-trap
```

### Usage

This solution collets motion events on a HTML element (by default on document), serialize these and send to a sinking server. Project uses custom format which described at top of `ci-trap/src/ci-trap.js` file.

```javascript
var CITrap = require(".../ci-trap/src/ci-trap");

var ciTrap = new CITrap();

ciTrap.start(); // start to collect events

ciTrap.stop(); // stop collecting

ciTrap.buffer(); // return the serialized events

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

The `/examples` directory contains a working mini application that demonstrates
ci-trap's core functions. After installing development dependencies, the
project defines several gulp tasks for your convenience:

- You may (re)bundle the mini-app with ci-trap's code with:

  ```
  ./node_modules/.bin/gulp scripts
  ```

- You can start a listener task that serves compiled and static example content:

  ```
  ./node_modules/.bin/gulp serve
  ```

  ...which will be accessible at: [localhost:8100](http://localhost:8100/)

If you want to see an example tracker application, please check [ci-tracker](https://github.com/cursorinsight/ci-tracker).

## Development

### Prerequisites

For development you need [node](https://nodejs.org) (>=4.0.0) and [npm](https://www.npmjs.com) (>=3.0.0).

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
