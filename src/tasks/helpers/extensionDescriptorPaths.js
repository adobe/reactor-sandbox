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

var glob = require('glob');
var files = require('../constants/files');

module.exports =
  glob.sync('{node_modules/*/,node_modules/@*/*/,}' + files.EXTENSION_DESCRIPTOR_FILENAME);
