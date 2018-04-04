const path = require('path');

module.exports = {
  entry: {'jquery.lazytable': ['core-js/es6/symbol', 'core-js/fn/promise', './src/main.js']},
  resolve: {
    extensions: ['.js']
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  }
};
