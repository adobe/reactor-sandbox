'use strict';

var path = require('path');

module.exports = function() {
  var packagePath = path.resolve('package.json');
  delete require.cache[packagePath];
  return require(packagePath);
};
