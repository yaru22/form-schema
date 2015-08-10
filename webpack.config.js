/* eslint-disable strict, no-var */

'use strict';

var webpack = require('webpack');

var plugins = [
  new webpack.optimize.OccurenceOrderPlugin(),
];

if (process.env.NODE_ENV === 'production') {
  plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        screw_ie8: true,
        warnings: false,
      },
    })
  );
}

module.exports = {
  externals: {

  },
  module: {
    loaders: [
      { test: /\.js$/, loaders: ['babel-loader'], exclude: /node_modules/ },
    ],
  },
  output: {
    library: 'Foo',
    libraryTarget: 'umd',
  },
  plugins: plugins,
  resolve: {
    extensions: ['', '.js'],
  },
};

/* eslint-enable */
