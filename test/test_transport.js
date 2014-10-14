document = require("jsdom")
             .jsdom("<html><body><div id='algernon-trap'></div></body></html>");
window = document.createWindow();

var
  assert = require("chai").assert,
  Transport = require("../src/algernon-trap/transport.js");

describe("AlgernonTrap::Transport", function() {

  var transport = new Transport(window);

  beforeEach(function() {
    transport.reset();
  });

  // 0 0 ++++ -> 000000 (A)
  it("should serialize [0, 0], [1, 1] to 'A'", function() {
    transport.push([0, 0], [1, 1]);
    assert.equal(transport.buffer(), "A");
  });

  // 0 010 ++ -> 001000 (I)
  it("should serialize [0, 2], [1, 3] to 'I'", function() {
    transport.push([0, 2], [1, 3]);
    assert.equal(transport.buffer(), "I");
  });

  // 010101 101010 -> 010101 101010 (Vq)
  it("should serialize [0, 2], [6, 6] to 'Vq'", function() {
    transport.push([21, 42], [6, 6]);
    assert.equal(transport.buffer(), "Vq");
  });

  // 0000001 +++++ -> 000000 100000 (Vq)
  it("should serialize [1], [7] to 'Ag'", function() {
    transport.push([1], [7]);
    assert.equal(transport.buffer(), "Ag");
  });

  it("should serialize underflow values to 0", function() {
    transport.push([-1, -100], [6, 12]);
    assert.equal(transport.buffer(), "AAA");
  });

  it("should serialize overflow values to MAX_BITS", function() {
    transport.push([1000000, 1000000], [6, 9]);
    assert.equal(transport.buffer(), "//4");
  });

  it("should serialize raw bytes", function() {
    transport.pushRawBytes("hello, world!");
    assert.equal(transport.buffer(), "ARhello%2C%20world!"); // AR == 17 bytes
  });
});
