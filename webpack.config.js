var webpack = require('webpack');

module.exports = {
  module: {
    loaders: [{
      test: /\.css$/,
      loader: 'style-loader!css-loader?minimize!postcss-loader'
    }, {
      test: /\.(png|jpg|gif)$/,
      loader: 'file-loader?name=img/img-[hash:6].[ext]'
    }, {
      test: /\.html$/,
      loader: 'html-loader'
    }, {
      test: /\.json$/,
      loader: 'json-loader'
    }, {
      test: /\.js$/,
      exclude: /.spec.js/,
      loader: 'uglify'
    }, {
      test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
      loader: 'file'
    }, {
      test: /bootstrap\/js\//,
      loader: 'imports?jQuery=jquery'
    }, {
      test: /\.(woff|woff2)$/,
      loader: 'url?prefix=font/&limit=5000'
    }, {
      test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
      loader: 'url?limit=10000&mimetype=application/octet-stream'
    }, {
      test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
      loader: 'url?limit=10000&mimetype=image/svg+xml'
    }]
  },
  entry: {
    main: './src/main.js'
  },
  devtool: 'source-map',
  output: {
    filename: './dist/[name].js'
  },
  plugins: [new webpack.NormalModuleReplacementPlugin(/^google$/, 'node-noop')]
};
