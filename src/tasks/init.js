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



/**
 * Generates files that the consumer may change to configure the sandbox. The directory of files
 * is ".sandbox" and will be placed in the current working directory.
 */

const fs = require('fs-extra');
const path = require('path');
const files = require('./constants/files');

module.exports = () => {
  [
    files.CONTAINER_FILENAME,
    files.LIB_SANDBOX_HTML_FILENAME
  ].forEach((filename) => {
    fs.copy(
      path.resolve(files.CLIENT_SRC_PATH, filename),
      path.resolve(files.CONSUMER_CLIENT_SRC_PATH, filename),
      {
        clobber: false
      }
    );
  });
};



