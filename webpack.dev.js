const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const CopyPlugin = require("copy-webpack-plugin");
const Dotenv = require('dotenv-webpack');
const path = require('path');

module.exports = merge(common, {
  context: path.resolve(__dirname, ''),
  mode: 'development',
  plugins: [
    new CopyPlugin({
      patterns: [
        { 
          from: "public",
          to: ".",
          globOptions: {
            dot: true,
            gitignore: true,
            ignore: ["**/index.html", "public"],
          },
        },
        { 
          from: ".env.development",
          to: "."
        }
      ]
    }),
    new Dotenv({
      path: './.env.development',
      safe: true,
      sample: './.env.example.development',
      allowEmptyValues: false,
      silent: false,
      defaults: false
    })
  ],
  devtool: 'inline-source-map',
  devServer: {
    static: './dist',
    client: {
      //logging: 'verbose',
      overlay: {
        errors: true,
        warnings: true,
      },
      reconnect: true,
    },
    host: '0.0.0.0',
    port: 8080,
    open: {
      app: {
        name: 'google-chrome',
        arguments: ['--incognito', '--new-window'],
      },
    },
  },
  watchOptions: {
    ignored: [
      "**/node_modules/**",
      "**/.git/**"
    ],
  },
});