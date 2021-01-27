const { TextEncoder, TextDecoder } = require('util');
/* eslint-disable import/no-extraneous-dependencies */
const {
  default: $JSDOMEnvironment,
  TestEnvironment,
} = require('jest-environment-jsdom');
/* eslint-enable import/no-extraneous-dependencies */

Object.defineProperty(exports, '__esModule', {
  value: true,
});

class JSDOMEnvironment extends $JSDOMEnvironment {
  constructor(...args) {
    const { global } = super(...args);
    if (!global.TextEncoder) {
      global.TextEncoder = TextEncoder;
    }
    if (!global.TextDecoder) {
      global.TextDecoder = TextDecoder;
    }
    if (!global.Uint8Array) {
      global.Uint8Array = Uint8Array;
    }
  }
}

exports.default = JSDOMEnvironment;
exports.TestEnvironment = TestEnvironment === $JSDOMEnvironment
  ? JSDOMEnvironment : TestEnvironment;
