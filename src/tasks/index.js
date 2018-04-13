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

const execSync = require('child_process').execSync;
const path = require('path');
const chalk = require('chalk');
const sandboxPkg = require('../../package.json');
const turbinePkg = require(path.resolve('node_modules/@adobe/reactor-turbine/package.json'));
const semverDiff = require('semver-diff');

const getLatestVersion = packageName => {
  return execSync('npm view ' + packageName + ' version')
    .toString('utf8')
    .replace(/\n$/, '');
};

const sandboxOutdated = semverDiff(sandboxPkg.version, getLatestVersion('@adobe/reactor-sandbox'));
const turbineOutdated = semverDiff(turbinePkg.version, getLatestVersion('@adobe/reactor-turbine'));

const task = process.argv.slice(2)[0];

if (sandboxOutdated || turbineOutdated) {
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
