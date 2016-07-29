#!/usr/bin/env node

'use strict';

/**
 * Generates files that the consumer may change to configure the sandbox.
 */

var fs = require('fs-extra');
var path = require('path');
var files = require('./constants/files');

[
  files.CONTAINER_FILENAME,
  files.VIEW_SANDBOX_HTML_FILENAME,
].forEach(function(filename) {
  fs.copy(
    path.resolve(files.CLIENT_SRC_PATH, filename),
    path.resolve(files.CONSUMER_CLIENT_SRC_PATH, filename),
    {
      clobber: false
    }
  );
});



