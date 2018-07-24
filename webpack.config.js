const PreloadWebpackPlugin = require('preload-webpack-plugin');

module.exports = {
  entry: {
    './dist/bundle': './src/index.js',
    './example/dist/bundle': './example/app.js'
  },
  output: {
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'eslint-loader'
      },
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: { presets: ['env'] }
        }
      }
    ]
  },
  plugins: [
    new PreloadWebpackPlugin()
  ],
  devtool: 'inline-source-map'
};
