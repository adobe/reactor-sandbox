'use strict';

/**
 * Runs a webserver that provides the sandbox environment. Refreshing will load the latest content.
 */

var path = require('path');
var fs = require('fs');
var express = require('express');
var webpack = require('webpack');
var webpackMiddleware = require('webpack-dev-middleware');
var getExtensionDescriptor = require('./helpers/getExtensionDescriptor');
var getExtensionDescriptorScript = require('./helpers/getExtensionDescriptorScript');
var getContainer = require('./helpers/getContainer');
var files = require('./constants/files');

var PORT = 3000;

module.exports = function() {
  var extensionDescriptor = getExtensionDescriptor();

  var app = express();

  app.get('/' + files.CONTAINER_FILENAME, function(req, res) {
    res.send(getContainer());
  });

  app.get('/' + files.ENGINE_FILENAME, function(req, res) {
    res.sendFile(files.TURBINE_ENGINE_PATH);
  });

  app.get('/' + files.EXTENSION_DESCRIPTOR_SCRIPT_FILENAME, function(req, res) {
    res.send(getExtensionDescriptorScript());
  });

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


