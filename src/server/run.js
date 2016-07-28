#!/usr/bin/env node

'use strict';

var path = require('path');
var fs = require('fs');
var express = require('express');
var webpack = require('webpack');
var webpackMiddleware = require('webpack-dev-middleware');
var getExtensionDescriptor = require('./getExtensionDescriptor');
var getContainer = require('./getContainer');
var files = require('./constants/files');

var PORT = 3000;

var extensionDescriptor = getExtensionDescriptor();

var app = express();

app.get('/container.js', function(req, res) {
  res.send(getContainer());
});

app.get('/engine.js', function(req, res) {
  res.sendFile(files.TURBINE_ENGINE_PATH);
});

app.get('/extensionDescriptor.js', function(req, res) {
  res.send('window.extensionDescriptor = ' +  JSON.stringify(extensionDescriptor) + ';');
});

// Produces viewSandbox.js
var webpackConfig = {
  entry: {
    viewSandbox: files.VIEW_SANDBOX_JS_PATH
  },
  // AJV needs json-loader.
  module: {
    loaders: [
      {
        'test': /\.json$/,
        'loader': 'json'
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
  }
};

var webpackMiddlewareOptions = {
  stats: 'errors-only'
};

app.use(webpackMiddleware(webpack(webpackConfig), webpackMiddlewareOptions));

var extensionViewsPath = path.resolve(extensionDescriptor.viewBasePath);
app.use('/extensionViews', express.static(extensionViewsPath));

// Give priority to consumer-provided files first and if they aren't provided we'll fall
// back to the defaults.
app.use(express.static(files.CONSUMER_OVERRIDES_PATH));
app.use(express.static(files.CLIENT_PATH));

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


