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

const { execSync } = require('child_process');
const chalk = require('chalk');
const path = require('path');

const cwd = path.join(path.dirname(__filename), '../../');
const isSandboxLinked = require('./isSandboxLinked');

module.exports = () => {
  if (isSandboxLinked() === false) {
    return;
  }

  try {
    execSync('npm run reactor-bridge-check', {
      cwd
    })
      .toString('utf8')
      .replace(/\n$/, '');
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(
      chalk.red(
        `Extension bridge is out of date. \
Please run "cd ${cwd} && npm run reactor-bridge-update && cd -".`
      )
    );
  }
};
