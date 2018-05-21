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

const fs = require('fs');
const path = require('path');
const files = require('../constants/files');
const beautify = require('js-beautify').js_beautify;

const turbinePkg = require(path.resolve('node_modules/@adobe/reactor-turbine/package.json'));
const CONSUMER_CONTAINER_TEMPLATE_PATH = path.resolve(
  files.CONSUMER_CLIENT_SRC_PATH,
  files.CONTAINER_FILENAME
);

module.exports = config => {
  config = Object.assign(config, {
    buildInfo: {
      turbineVersion: turbinePkg.version,
      turbineBuildDate: new Date().toISOString(),
      buildDate: new Date().toISOString(),
      environment: 'development'
    }
  });

  const fileContent = `module.exports = ${JSON.stringify(config)}`;
  fs.writeFileSync(CONSUMER_CONTAINER_TEMPLATE_PATH, beautify(fileContent, { indent_size: 2 }));
};
