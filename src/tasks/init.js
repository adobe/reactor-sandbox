/*!
 * ADOBE SYSTEMS INCORPORATED
 * Copyright 2016 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  Adobe permits you to use, modify, and distribute this file in accordance with the
 * terms of the Adobe license agreement accompanying it.  If you have received this file from a
 * source other than Adobe, then your use, modification, or distribution of it requires the prior
 * written permission of Adobe.
 */

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



