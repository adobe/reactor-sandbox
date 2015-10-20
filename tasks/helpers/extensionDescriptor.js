'use strict';

var path = require('path');
var files = require('../constants/files');

var extensionDescriptor;

try {
  extensionDescriptor = require(path.resolve(files.EXTENSION_DESCRIPTOR_FILENAME));
} catch (e) {
  if (e.code === 'MODULE_NOT_FOUND') {
    console.warn(files.EXTENSION_DESCRIPTOR_FILENAME + ' not found. Some sandbox features ' +
      'will be unavailable');
  } else {
    throw e;
  }
}

module.exports = extensionDescriptor;
