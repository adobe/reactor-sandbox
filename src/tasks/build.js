'use strict';

/**
 * Builds a static, standalone sandbox directory. Does not provide any web server.
 * The created directory is "sandbox" under the current working directory.
 */

var path = require('path');
var fs = require('fs-extra');
var webpack = require('webpack');
var chalk = require('chalk');
var validateExtensionDescriptor = require('@reactor/extension-support-validator');
var getExtensionDescriptor = require('./helpers/getExtensionDescriptor');
var getExtensionDescriptorScript = require('./helpers/getExtensionDescriptorScript');
var getContainer = require('./helpers/getContainer');
var files = require('./constants/files');

module.exports = function() {
  var extensionDescriptor = getExtensionDescriptor();
  var validationError = validateExtensionDescriptor(extensionDescriptor);

  if (validationError) {
    console.log(chalk.red(validationError));
    process.exit(1);
  }

  fs.ensureDirSync(files.DIST_PATH);

  fs.writeFileSync(path.resolve(files.DIST_PATH, files.EXTENSION_DESCRIPTOR_SCRIPT_FILENAME),
    getExtensionDescriptorScript());

  fs.copySync(files.TURBINE_ENGINE_PATH, path.resolve(files.DIST_PATH, files.ENGINE_FILENAME));

  // Produces viewSandbox.js
  var webpackConfig = require('./webpack.viewSandbox.config');
  webpackConfig.output.path = files.DIST_PATH;
  webpack(webpackConfig).run(function() {});

  var extensionViewsPath = path.resolve(extensionDescriptor.viewBasePath);
  fs.copySync(extensionViewsPath, path.resolve(files.DIST_PATH, files.EXTENSION_VIEWS_DIRNAME));

  fs.copySync(files.CLIENT_SRC_PATH, files.DIST_PATH);

  try {
    fs.copySync(files.CONSUMER_CLIENT_SRC_PATH, files.DIST_PATH);
  } catch (error) {
    // It will throw an error if the consumer doesn't have an override directory. That's okay.
  }

  fs.writeFileSync(path.resolve(files.DIST_PATH, files.CONTAINER_FILENAME), getContainer());
};



