#!/usr/bin/env node

/***************************************************************************************
 * (c) 2017 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 ****************************************************************************************/

const path = require('path');
const sandboxPkgPath = '../../package.json';
const turbinePkgPath = path.resolve('node_modules/@adobe/reactor-turbine/package.json');

// After running the update command (npm i @adobe/reactor-sandbox@latest...), the sandbox
// was still showing the warning message the next time was run. We want to always compare
// the real installed version (not a cached version).
delete require.cache[sandboxPkgPath];
delete require.cache[turbinePkgPath];

const chalk = require('chalk');
const sandboxPkg = require(sandboxPkgPath);
const turbinePkg = require(turbinePkgPath);
const updateNotifier = require('update-notifier');

const task = process.argv.slice(2)[0];

const sandboxUpdateNotifier = updateNotifier({
  pkg: sandboxPkg,
  updateCheckInterval: 0
});

const turbineUpdateNotifier = updateNotifier({
  pkg: turbinePkg,
  updateCheckInterval: 0
});

if (sandboxUpdateNotifier.update || turbineUpdateNotifier.update) {
  console.log(
    chalk.red(
      'Your sandbox is out of date. To ensure you are testing against the ' +
        'latest code, please first update your sandbox by running ' +
        `${chalk.cyan('npm i @adobe/reactor-sandbox@latest @adobe/reactor-turbine@latest')}.`
    )
  );
}

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
