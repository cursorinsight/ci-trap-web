/* global module */

var PageScrollHandler = function(element, state, buffer) {
"use strict";
// ---------------------------------------------------------------------------

var handler = function(event) {
  // noop
};

this.start = function() {
  element.addEventListener("scroll", handler);
};

this.stop = function() {
  element.removeEventListener("scroll", handler);
};

// ---------------------------------------------------------------------------
};

module.exports = PageScrollHandler;
