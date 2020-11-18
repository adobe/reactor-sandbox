#!/usr/bin/env node
/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

/* eslint-disable global-require */

const chalk = require('chalk');
const validateSandboxVersion = require('./helpers/validateSandboxVersion');
const validateExtensionBridge = require('./helpers/validateExtensionBridge');

validateSandboxVersion();
validateExtensionBridge();

const task = process.argv.slice(2)[0];

let execute;

switch (task) {
  case 'init':
    execute = require('./tasks/init');
    break;
  default:
    // eslint-disable-next-line no-console
    execute = require('./tasks/run');
    break;
}

execute().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(chalk.red(error));
  process.exit(1);
});
