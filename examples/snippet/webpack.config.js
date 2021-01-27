const path = require('path');
const express = require('express');
const httpMiddleware = require('../common/http-middleware');

module.exports = {
  mode: 'development',

  entry: {},

  devServer: {
    allowedHosts: 'all',
    host: '0.0.0.0',
    port: 3000,
    static: [
      { directory: path.resolve(__dirname, 'public') },
      { directory: path.resolve(__dirname, '..', '..', 'dist') },
    ],

    setupMiddlewares: (middlewares, devServer) => {
      if (!devServer) {
        throw new Error('webpack-dev-server is not defined');
      }

      middlewares.unshift(express.raw({ limit: '50mb', type: '*/*' }));
      middlewares.unshift(express.urlencoded({ extended: true }));

      middlewares.push({
        path: '/api/1/s',
        middleware: httpMiddleware(),
      });

      return middlewares;
    },
  },
};
