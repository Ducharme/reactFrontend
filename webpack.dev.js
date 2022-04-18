const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const Dotenv = require('dotenv-webpack');
const path = require('path');

module.exports = merge(common, {
  context: path.resolve(__dirname, ''),
  mode: 'development',
  plugins: [
    new Dotenv({
      path: './.env.development',
      safe: true,
      allowEmptyValues: false,
      silent: false,
      defaults: false
    })
  ],
  devtool: 'inline-source-map',
  devServer: {
    static: './dist',
  },
});