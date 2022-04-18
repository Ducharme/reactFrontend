const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const CopyPlugin = require("copy-webpack-plugin");
const Dotenv = require('dotenv-webpack');

module.exports = merge(common, {
  mode: 'production',
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
          from: ".env.production",
          to: "."
        }
      ]
    }),
    new Dotenv({
      path: './.env.production',
      safe: true,
      allowEmptyValues: false,
      silent: false,
      defaults: false
    })
  ]
});