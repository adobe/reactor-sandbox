/*************************************************************************
 * ADOBE CONFIDENTIAL
 * ___________________
 *
 *  Copyright 2016 Adobe Systems Incorporated
 *  All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and are protected by all applicable intellectual property
 * laws, including trade secret and copyright laws.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 **************************************************************************/

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



