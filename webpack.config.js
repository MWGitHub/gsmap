module.exports = {
  entry: './src/index.js',
  output: {
    path: './dist',
    filename: 'gsmap.bundle.js'
  },
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader'
    }]
  },
  devtool: 'source-map'
};
