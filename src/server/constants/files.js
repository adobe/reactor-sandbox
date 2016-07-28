'use strict';

var path = require('path');

var CLIENT_PATH = path.resolve(__dirname, '../../client');

var files = {
  EXTENSION_DESCRIPTOR_FILENAME: 'extension.json',
  CLIENT_PATH: CLIENT_PATH,
  CONSUMER_OVERRIDES_PATH: path.resolve(process.cwd(), '.sandbox'),
  CONTAINER_FILENAME: 'container.js',
  SANDBOX_CSS_PATH: path.resolve(CLIENT_PATH, 'sandbox.css'),
  VIEW_SANDBOX_JS_PATH: path.resolve(CLIENT_PATH, 'viewSandbox.js'),
  // While we could use require.resolve to find the path to turbine it doesn't seem to find the
  // path when sandbox is npm linked into a project.
  TURBINE_ENGINE_PATH: path.resolve(process.cwd(), 'node_modules/@reactor/turbine/dist/engine.js'),
  VIEW_SANDBOX_HTML_FILENAME: 'viewSandbox.html'
};

module.exports = files;
