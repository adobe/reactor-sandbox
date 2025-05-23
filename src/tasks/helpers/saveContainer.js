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

/* eslint-disable no-param-reassign */

const fs = require('fs-extra');
const path = require('path');
const beautify = require('js-beautify').js_beautify;
const files = require('../constants/files');

const CONSUMER_CONTAINER_TEMPLATE_PATH = path.resolve(
  files.CONSUMER_PROVIDED_FILES_PATH,
  files.CONTAINER_FILENAME
);

module.exports = (config) => {
  const fileContent = `module.exports = ${JSON.stringify(config)}`;

  fs.ensureDirSync(files.CONSUMER_PROVIDED_FILES_PATH);
  fs.writeFileSync(
    CONSUMER_CONTAINER_TEMPLATE_PATH,
    /* eslint-disable-next-line camelcase */
    beautify(fileContent, { indent_size: 2 })
  );
};
