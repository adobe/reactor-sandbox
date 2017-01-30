#!/usr/bin/env node

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

var task = process.argv.slice(2)[0];

switch (task) {
  case 'build':
    require('./build')();
    break;
  case 'init':
    require('./init')();
    break;
  default:
    require('./run')();
    break;
}
