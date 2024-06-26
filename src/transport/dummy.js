//------------------------------------------------------------------------------
// Copyright (C) 2024- Cursor Insight Ltd.
//
// All rights reserved.
//------------------------------------------------------------------------------
// Dummy transport for Cursor Insight's ligthweight mouse tracker.
//------------------------------------------------------------------------------

import Transport from './transport';
import simpleAutoBind from '../simpleAutoBind';

class Dummy extends Transport {
  constructor(metadata, allowInMemoryBuffer) {
    super(metadata, allowInMemoryBuffer);
    simpleAutoBind(this);
  }

  // `enableCompression` setter
  // eslint-disable-next-line class-methods-use-this
  set enableCompression(_enableCompression) {
    // Nothing to do
  }

  // Closes the current transport channel.
  // eslint-disable-next-line class-methods-use-this
  close() {
    // There is no transport channel, so there is nothing to do.
  }
}

// No default export, just the class
export default Dummy;
