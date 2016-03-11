'use strict';

var path = require('path');
var files = require('../constants/files');

module.exports = function() {
  try {
    var descriptorPath = path.resolve(files.EXTENSION_DESCRIPTOR_FILENAME)
    // When the extension descriptor changes, we want the updated version.
    // This can happen when using a gulp watch task.
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
