/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const fs = require('fs-extra');
const build = require('./helpers/build');
const files = require('./constants/files');

module.exports = () => {
  const buildFiles = build();

  fs.ensureDirSync(`${files.CONSUMER_PROVIDED_FILES_PATH}/files`);
  Object.keys(buildFiles).forEach((fileName) => {
    fs.writeFileSync(`${files.CONSUMER_PROVIDED_FILES_PATH}${fileName}`, buildFiles[fileName]);
  });
};
