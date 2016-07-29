'use strict';

var path = require('path');

var ENGINE_FILENAME = 'engine.js';
var CLIENT_SRC_PATH = path.resolve(__dirname, '../../client');

var files = {
  EXTENSION_DESCRIPTOR_FILENAME: 'extension.json',
  EXTENSION_DESCRIPTOR_SCRIPT_FILENAME: 'extensionDescriptor.js',
  CLIENT_SRC_PATH: CLIENT_SRC_PATH,
  CONSUMER_CLIENT_SRC_PATH: path.resolve('.sandbox'),
  CONTAINER_FILENAME: 'container.js',
  ENGINE_FILENAME: 'engine.js',
  SANDBOX_CSS_PATH: path.resolve(CLIENT_SRC_PATH, 'sandbox.css'),
  VIEW_SANDBOX_JS_PATH: path.resolve(CLIENT_SRC_PATH, 'viewSandbox.js'),
  // While we could use require.resolve to find the path to turbine it doesn't seem to find the
  // path when sandbox is npm linked into a project.
  TURBINE_ENGINE_PATH: path.resolve('node_modules/@reactor/turbine/dist', ENGINE_FILENAME),
  VIEW_SANDBOX_HTML_FILENAME: 'viewSandbox.html',
  DIST_PATH: path.resolve(__dirname, '../../../dist'),
  EXTENSION_VIEWS_DIRNAME: 'extensionViews'
};

module.exports = files;
