'use strict';

/**
 * Generates files that the consumer may change to configure the sandbox. The directory of files
 * is ".sandbox" and will be placed in the current working directory.
 */

var fs = require('fs-extra');
var path = require('path');
var files = require('./constants/files');

module.exports = function() {
  [
    files.CONTAINER_FILENAME,
    files.LIB_SANDBOX_HTML_FILENAME
  ].forEach(function(filename) {
    fs.copy(
      path.resolve(files.CLIENT_SRC_PATH, filename),
      path.resolve(files.CONSUMER_CLIENT_SRC_PATH, filename),
      {
        clobber: false
      }
    );
  });
};



