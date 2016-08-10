var glob = require('glob');
var files = require('../constants/files');

module.exports =
  glob.sync('{node_modules/*/,node_modules/@*/*/,}' + files.EXTENSION_DESCRIPTOR_FILENAME);
