var webpack = require('webpack');
var min = process.argv.indexOf('--min') !== -1;
var plugins = [];
var outputName = 'ComboCharts.js'

if (min) {
  plugins.push(new webpack.optimize.UglifyJsPlugin({
    minimize: true
  }));
  outputName = 'ComboCharts.min.js';
}

module.exports = {
  entry: './src/ComboCharts.js',
  output: {
    libraryTarget: "var",
    library: "ComboChart",
    path: './dist',
    filename: outputName
  },
  plugins: plugins
};