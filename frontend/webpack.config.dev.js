var path = require('path')
var webpack = require('webpack')

var stripeLive = process.env.STRIPE_PUBKEY_LIVE
var stripeTest = process.env.STRIPE_PUBKEY_TEST

module.exports = {
  devtool: 'cheap-module-eval-source-map',
  entry: [
    'webpack-hot-middleware/client',
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
        STRIPE_PUBKEY_LIVE: stripeLive ? JSON.stringify(stripeLive) : null,
        STRIPE_PUBKEY_TEST: stripeTest ? JSON.stringify(stripeTest) : null
      }
    }),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin()
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