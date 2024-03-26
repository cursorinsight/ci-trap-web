const path = require('path');
const express = require('express');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const httpMiddleware = require('../common/http-middleware');
const wsMiddleware = require('../common/ws-middleware');

module.exports = {
  mode: 'development',

  devServer: {
    allowedHosts: 'all',
    host: '0.0.0.0',
    port: 3000,
    static: [
      { directory: path.resolve(__dirname, 'public') },
    ],

    setupMiddlewares: (middlewares, devServer) => {
      if (!devServer) {
        throw new Error('webpack-dev-server is not defined');
      }

      middlewares.unshift(express.raw({ limit: '50mb', type: '*/*' }));
      middlewares.unshift(express.urlencoded({ extended: true }));

      middlewares.push({
        path: '/api/1/s',
        middleware: httpMiddleware({
          dataDirectory: path.resolve(__dirname, 'output'),
        }),
      });

      return middlewares;
    },

    onListening: (devServer) => {
      devServer.server.on('upgrade', wsMiddleware({
        dataDirectory: path.resolve(__dirname, 'output'),
      }));
    },

    webSocketServer: false,
  },

  entry: {
    'index': path.resolve(__dirname, 'src', 'index.js'),
  },

  devtool: 'inline-source-map',

  plugins: [
    new CleanWebpackPlugin(),
    new Dotenv({
      allowEmptyValues: true,
      expand: true,
      systemvars: true,
      path: path.resolve(__dirname, '..', '..', '.env'),
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      chunks: ['index'],
      template: path.resolve(__dirname, 'src', 'index.html'),
    }),
  ],

  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },

  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
};
