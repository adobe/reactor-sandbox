'use strict';

var path = require('path');
var files = require('../constants/files');

module.exports = function() {
  try {
    var descriptorPath = path.resolve(files.EXTENSION_DESCRIPTOR_FILENAME)
    delete require.cache[descriptorPath];
    return require(descriptorPath);
  } catch (e) {
    if (e.code === 'MODULE_NOT_FOUND') {
      console.warn(files.EXTENSION_DESCRIPTOR_FILENAME + ' not found. Some sandbox features ' +
        'will be unavailable');
    } else {
      throw e;
    }
  }
};
