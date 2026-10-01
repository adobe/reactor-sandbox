/*
Copyright 2026 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

// Test fixture for augmentExtensions.test.js ("ignores requires in comments, strings...").
// Every require below except ../helpers/logger points at a file that does not exist. If the
// scanner picked any of them up, reading the file would throw ENOENT.

// require('./missing-line-comment');
/* require('./missing-block-comment'); */
var str = "require('./missing-string')";
var name = 'dynamic';
var dynamic = require(`./missing-${name}`);
// eslint-disable-next-line import/no-extraneous-dependencies
var cookie = require('@adobe/reactor-cookie');
var pkg = require('some-package');
var logger = require('../helpers/logger');

module.exports = function () {
  logger.log(str, dynamic, cookie, pkg);
};
