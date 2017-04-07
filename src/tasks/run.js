/***************************************************************************************
 * (c) 2017 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 ****************************************************************************************/

'use strict';

/**
 * Runs a webserver that provides the sandbox environment. Refreshing will load the latest content.
 */

var path = require('path');
var fs = require('fs');
var express = require('express');
var webpack = require('webpack');
var webpackMiddleware = require('webpack-dev-middleware');
var chalk = require('chalk');
var validateExtensionDescriptor = require('@adobe/reactor-validator');
var getExtensionDescriptor = require('./helpers/getExtensionDescriptor');
var getExtensionDescriptorScript = require('./helpers/getExtensionDescriptorScript');
var extensionDescriptorPaths = require('./helpers/extensionDescriptorPaths');
var getContainer = require('./helpers/getContainer');
var files = require('./constants/files');

var PORT = 3000;

module.exports = function() {
  var validationError;
  var app = express();

  app.get('/' + files.CONTAINER_FILENAME, function(req, res) {
    // Always pull the latest extension descriptor. The extension developer may have changed it
    // since the last request.
    validationError = validateExtensionDescriptor(getExtensionDescriptor());

    if (validationError) {
      console.error(chalk.red(validationError));
      res.status(500).send(validationError);
    } else {
      res.send(getContainer());
    }
  });

  app.get('/' + files.ENGINE_FILENAME, function(req, res) {
    res.sendFile(files.TURBINE_ENGINE_PATH);
  });

  app.get('/' + files.EXTENSION_DESCRIPTOR_SCRIPT_FILENAME, function(req, res) {
    res.send(getExtensionDescriptorScript());
  });

  app.get('/extensionbridge/extensionbridge-child.js', function(req, res) {
    res.sendFile(files.EXTENSION_BRIDGE_CHILD_PATH);
  });

  // Server hosted lib files from inside extensions.
  app.get('/hostedLibFiles/:extensionName/:extensionVersion/:file', function (req, res) {
    var params = req.params;
    var extensionName = params.extensionName;
    var extensionVersion = params.extensionVersion;
    var file = params.file;

    // Get the descriptor that matches the extension name and the version from the request.
    var extensionDescriptorPath =
      extensionDescriptorPaths.filter(function(extensionDescriptorPath) {
        var extensionDescriptor = require(path.resolve(extensionDescriptorPath));
        return extensionDescriptor.name === extensionName
          && extensionDescriptor.version === extensionVersion;
      })[0];

    if (!extensionDescriptorPath) {
      res.status(404).send('Cannot GET ' + req.originalUrl);
      return;
    }

    var extensionDescriptor = require(path.resolve(extensionDescriptorPath));
    // If no hosted files are defined in the descriptor, do nothing.
    var hostedFilePath = (extensionDescriptor['hostedLibFiles'] || [])
      .filter(function(hostedFilePath) {
        return hostedFilePath.endsWith(file);
      })[0];

    if (!hostedFilePath) {
      res.status(404).send('Cannot GET ' + req.originalUrl);
      return;
    }

    var extensionPath = path.dirname(path.resolve(extensionDescriptorPath));
    res.sendFile(path.join(extensionPath, hostedFilePath));
  });

  var extensionDescriptor = getExtensionDescriptor();
  validationError = validateExtensionDescriptor(extensionDescriptor);

  // If there is a validation error, we're going to let express still run. This gives the
  // extension developer a chance to fix their extension.json or whatever without having to
  // re-run the sandbox.
  if (validationError) {
    console.error(chalk.red(validationError));
  }

  // Produces viewSandbox.js
  var webpackConfig = require('./webpack.viewSandbox.config');

  var webpackMiddlewareOptions = {
    stats: 'errors-only'
  };

  app.use(webpackMiddleware(webpack(webpackConfig), webpackMiddlewareOptions));

  var extensionViewsPath = path.resolve(extensionDescriptor.viewBasePath);
  app.use('/' + files.EXTENSION_VIEWS_DIRNAME, express.static(extensionViewsPath));

  // Give priority to consumer-provided files first and if they aren't provided we'll fall
  // back to the defaults.
  app.use(express.static(files.CONSUMER_CLIENT_SRC_PATH));
  app.use(express.static(files.CLIENT_SRC_PATH));

  app.get('/', function(req, res) {
    res.redirect('/' + files.VIEW_SANDBOX_HTML_FILENAME);
  });

  app.listen(PORT, function(error) {
    if (error) {
      throw error;
    } else {
      console.log('\nExtension sandbox running at http://localhost:' + PORT);
    }
  });
};


