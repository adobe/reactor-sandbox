'use strict';

var path = require('path');
var files = require('../constants/files');

module.exports = function() {
  try {
    var descriptorPath = path.resolve(files.EXTENSION_DESCRIPTOR_FILENAME);
    // When the extension descriptor changes while node is running, we want the updated version.
    delete require.cache[descriptorPath];
    return require(descriptorPath);
  } catch (e) {
    if (e.code === 'MODULE_NOT_FOUND') {
      throw new Error('You must create an extension.json before using the sandbox.');
    } else {
      throw e;
    }
  }
};
