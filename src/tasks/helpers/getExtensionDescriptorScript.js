'use strict';

var getExtensionDescriptor = require('./getExtensionDescriptor');

module.exports = function() {
  return 'window.extensionDescriptor = ' +  JSON.stringify(getExtensionDescriptor()) + ';';
};
