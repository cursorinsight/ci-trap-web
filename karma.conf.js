module.exports = (config) => {
  config.set({
    // ... normal karma configuration
    files: [
      // all files ending in "_test"
      { pattern: 'test/*_test.js', watched: false },
      { pattern: 'test/**/*_test.js', watched: false }
      // each file acts as entry point for the webpack configuration
    ],

    frameworks: ['mocha'],

    preprocessors: {
      // add webpack as preprocessor
      'test/*_test.js': [ 'webpack', 'sourcemap' ],
      'test/**/*_test.js': [ 'webpack', 'sourcemap' ]
    },

    webpack: {
      // karma watches the test entry points
      // (you don't need to specify the entry option)
      // webpack watches dependencies

      // webpack configuration
    },

    singleRun: true,

    webpackMiddleware: {
      // webpack-dev-middleware configuration
      // i. e.
      stats: 'errors-only'
    },

    browsers: ['Chrome']

  });
};
