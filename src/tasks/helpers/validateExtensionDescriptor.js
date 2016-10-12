'use strict';

var fs = require('fs');
var pathUtil = require('path');
var Ajv = require('ajv');
var extensionDescriptorSchema = require('@reactor/turbine-schemas/extension-package.json');

var isFile = function(path) {
  try {
    return fs.statSync(path).isFile();
  } catch (e) {
    return false;
  }
};

var isDir = function(path) {
  try {
    return fs.statSync(path).isDirectory();
  } catch (e) {
    return false;
  }
};

var stripQueryAndAnchor = function(path) {
  path = path.split('?').shift();
  path = path.split('#').shift();
  return path;
};

var validateJsonStructure = function(extensionDescriptor) {
  var ajv = new Ajv();

  if (!ajv.validate(extensionDescriptorSchema, extensionDescriptor)) {
    return ajv.errorsText();
  }
};

var validateViewBasePath = function(extensionDescriptor) {
  var absViewBasePath = pathUtil.resolve(
    process.cwd(),
    extensionDescriptor.viewBasePath
  );

  if (!isDir(absViewBasePath)) {
    return absViewBasePath + ' is not a directory.';
  }
};

var validateFiles = function(extensionDescriptor) {
  var paths = [];

  if (extensionDescriptor.configuration) {
    paths.push(pathUtil.resolve(
      process.cwd(),
      extensionDescriptor.viewBasePath,
      stripQueryAndAnchor(extensionDescriptor.configuration.viewPath)
    ));
  }

  ['events', 'conditions', 'actions', 'dataElements'].forEach(function(featureType) {
    var features = extensionDescriptor[featureType];

    if (features) {
      features.forEach(function(feature) {
        paths.push(pathUtil.resolve(
          process.cwd(),
          extensionDescriptor.viewBasePath,
          stripQueryAndAnchor(feature.viewPath)
        ));

        paths.push(pathUtil.resolve(
          process.cwd(),
          feature.libPath
        ));
      });
    }
  });

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (!isFile(path)) {
      return path + ' is not a file.';
    }
  }
};


module.exports = function(extensionDescriptor) {
  var validators = [
    validateJsonStructure,
    validateViewBasePath,
    validateFiles
  ];

  for (var i = 0; i < validators.length; i++) {
    var error = validators[i](extensionDescriptor);

    if (error) {
      return 'An error was found in your extension.json: ' + error;
    }
  }
};
