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



/**
 * Runs a webserver that provides the sandbox environment. Refreshing will load the latest content.
 */

const path = require('path');
const fs = require('fs');
const https = require('https');
const express = require('express');
const webpack = require('webpack');
const webpackMiddleware = require('webpack-dev-middleware');
const chalk = require('chalk');
const validateExtensionDescriptor = require('@adobe/reactor-validator');
const getExtensionDescriptor = require('./helpers/getExtensionDescriptor');
const getExtensionDescriptorScript = require('./helpers/getExtensionDescriptorScript');
const extensionDescriptorPaths = require('./helpers/extensionDescriptorPaths');
const getContainer = require('./helpers/getContainer');
const files = require('./constants/files');

const PORT = 3000;
const SSL_PORT = 4000;

module.exports = function() {
  let validationError;
  const app = express();

  https.createServer({
    key: fs.readFileSync(__dirname + '/../../cert/key.pem'),
    cert: fs.readFileSync(__dirname + '/../../cert/cert.pem')
  }, app).listen(SSL_PORT);

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
  app.get('/hostedLibFiles/:extensionName/:extensionVersion/:file', (req, res) => {
    const params = req.params;
    const extensionName = params.extensionName;
    const extensionVersion = params.extensionVersion;
    const file = params.file;

    // Get the descriptor that matches the extension name and the version from the request.
    const extensionDescriptorPath =
      extensionDescriptorPaths.filter(function(extensionDescriptorPath) {
        const extensionDescriptor = require(path.resolve(extensionDescriptorPath));
        return extensionDescriptor.name === extensionName
          && extensionDescriptor.version === extensionVersion;
      })[0];

    if (!extensionDescriptorPath) {
      res.status(404).send('Cannot GET ' + req.originalUrl);
      return;
    }

    const extensionDescriptor = require(path.resolve(extensionDescriptorPath));
    // If no hosted files are defined in the descriptor, do nothing.
    const hostedFilePath = (extensionDescriptor['hostedLibFiles'] || [])
      .filter(function(hostedFilePath) {
        return hostedFilePath.endsWith(file);
      })[0];

    if (!hostedFilePath) {
      res.status(404).send('Cannot GET ' + req.originalUrl);
      return;
    }

    const extensionPath = path.dirname(path.resolve(extensionDescriptorPath));
    res.sendFile(path.join(extensionPath, hostedFilePath));
  });

  const extensionDescriptor = getExtensionDescriptor();
  validationError = validateExtensionDescriptor(extensionDescriptor);

  // If there is a validation error, we're going to let express still run. This gives the
  // extension developer a chance to fix their extension.json or whatever without having to
  // re-run the sandbox.
  if (validationError) {
    console.error(chalk.red(validationError));
  }

  // Produces viewSandbox.js
  const webpackConfig = require('./webpack.viewSandbox.config');

  const webpackMiddlewareOptions = {
    stats: 'errors-only'
  };

  app.use(webpackMiddleware(webpack(webpackConfig), webpackMiddlewareOptions));

  const extensionViewsPath = path.resolve(extensionDescriptor.viewBasePath);
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
      console.log(
        '\nExtension sandbox running at http://localhost:' + PORT +
        ' and at https://localhost:' + SSL_PORT);
    }
  });
};


