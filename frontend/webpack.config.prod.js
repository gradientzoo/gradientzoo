var path = require('path')
var webpack = require('webpack')

var gaid = process.env.GOOGLE_ANALYTICS_ID
var stripeLive = process.env.STRIPE_PUBKEY_LIVE
var stripeTest = process.env.STRIPE_PUBKEY_TEST

module.exports = {
  entry: [
    './index'
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/static/'
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
        GOOGLE_ANALYTICS_ID: gaid ? JSON.stringify(gaid) : null,
        STRIPE_PUBKEY_LIVE: stripeLive ? JSON.stringify(stripeLive) : null,
        STRIPE_PUBKEY_TEST: stripeTest ? JSON.stringify(stripeTest) : null
      }
    }),
    new webpack.NoErrorsPlugin(),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        sequences: true,
        properties: true,
        dead_code: true,
        conditionals: true,
        comparisons: true,
        evaluate: true,
        booleans: true,
        loops: true,
        unused: true,
        hoist_funs: true,
        if_return: true,
        join_vars: true,
        cascade: true,
        collapse_vars: true,
        warnings: false,
        negate_iife: true,
        pure_getters: true,
        unsafe: true
      }
    })
  ],
  module: {
    loaders: [
      {
        test: /\.js$/,
        loaders: [ 'babel' ],
        exclude: /node_modules/,
        include: __dirname
      },
      {
        test: /\.json$/,
        loader: 'json'
      }
    ]
  },
  resolve: {
    alias: {
      // temporary fix for missing require in `react-ga`
      // cf. https://github.com/react-ga/react-ga/issues/53
      'react/lib/Object.assign': 'object-assign'
    }
  }
}