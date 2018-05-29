
const path = require('path');
const files = require('./constants/files');
const IgnorePlugin = require('webpack').IgnorePlugin;

module.exports = {
  entry: {
    viewSandbox: files.VIEW_SANDBOX_JS_PATH
  },
  // AJV needs json-loader.
  module: {
    // Without this webpack will log a warning.
    // https://github.com/epoberezkin/ajv/pull/288#issuecomment-253286408
    noParse: /node_modules\/ajv\/dist\/ajv.bundle.js/,
    loaders: [
      {
        'test': /\.json$/,
        loader: 'json-loader'
      },
      {
        test: /viewSandbox\.js$/,
        loader: 'babel-loader'
      }
    ]
  },
  node: {
    // We had an error similar with the one described here:
    // https://github.com/josephsavona/valuable/issues/9
    fs: 'empty'
  },
  output: {
    path: '/',
    filename: 'viewSandbox.js'
  },
  plugins: [
    // Fixing ajv async plugin warnings.
    // More details here: https://github.com/epoberezkin/ajv/issues/117
    new IgnorePlugin(/regenerator|nodent|js\-beautify/, /ajv/)
  ],
  resolveLoader: {
    // Important so that the webpack loaders are found when sandbox is being used both
    // with npx and as an installed dependency.
    modules: [
      path.resolve(__dirname, "../../node_modules"),
      'node_modules'
    ],
    moduleExtensions: ['-loader']
  }
};
