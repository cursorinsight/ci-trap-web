module.exports = function config(api) {
  // Cache the returned value "forever" and don't call this function again.
  api.cache(true);

  return {
    'plugins': [
      ['@babel/plugin-transform-runtime', { 'regenerator': true }],
    ],
    'presets': [
      ['@babel/preset-env', { 'modules': false }],
    ],
    'env': {
      'test': {
        'presets': [['@babel/preset-env']],
      },
    },
  };
};
