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
