const path = require('path');

module.exports = {
  entry: {"jquery.lazytable": "./src/main.js"},
  resolve: {
    extensions: ['.js']
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  }
};
