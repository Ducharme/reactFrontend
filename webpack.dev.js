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
      allowEmptyValues: false,
      silent: false,
      defaults: false
    })
  ],
  devtool: 'inline-source-map',
  devServer: {
    static: './dist',
  },
  watchOptions: {
    ignored: [
      "**/node_modules/**",
      "**/.git/**"
    ],
  },
});