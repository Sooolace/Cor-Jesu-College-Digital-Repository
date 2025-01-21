const path = require('path');

module.exports = {
  entry: './src/index.js', // your entry point
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'), // output directory
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 3000,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader', // if you're using Babel
        },
      },
    ],
  },
};
