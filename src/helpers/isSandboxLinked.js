/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const fs = require('fs');

module.exports = () => {
  try {
    // We no longer test for a symbolic link because of pnpm.
    // Probably the safest way to detect if we are doing developer
    // work on sandbox is to search for the Git directory.
    return fs.existsSync('node_modules/@adobe/reactor-sandbox/.git');
  } catch (e) {
    return false;
  }
};
