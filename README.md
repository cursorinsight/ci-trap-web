# ci-trap

`ci-trap` is a lightweight mouse movement tracker library for browsers.

## Using the module

TBD

## Installation (for further development purposes)

Install dependencies with [NPM](https://www.npmjs.org):

```
npm install
```

## Example

The `/examples` directory contains a working mini application that demonstrates
ci-trap's core functions.  After installing development dependencies, the
project defines several gulp tasks for your convenience:

- You may (re)bundle the mini-app with ci-trap's code with:

  ```
  ./node_modules/.bin/gulp scripts
  ```

- Listener task that serves compiled and static example content:

  ```
  ./node_modules/.bin/gulp serve
  ```

  ...which will be accessible at: [localhost:8100](http://localhost:8100/)

If you want to see example tracker, please check [this project](https://github.com/cursorinsight/ci-tracker).

## License

ci-trap is released under the [MIT license](https://github.com/cursorinsight/ci-trap/blob/master/LICENSE.md).
