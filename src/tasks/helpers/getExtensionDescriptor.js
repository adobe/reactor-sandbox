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
/* eslint-disable import/no-dynamic-require */

const path = require('path');
const fsExtra = require('fs-extra');
const files = require('../constants/files');

module.exports = () => {
  try {
    // console.log('THE DESCRIPTOR FILE PATH IS ', path.resolve(files.EXTENSION_DESCRIPTOR_FILENAME));
    // console.log('AND THE CURRENT __DIRNAME IS ', path.resolve(__dirname));
    // // TODO: couldn't resolve into public folder, timing issue???
    // fsExtra.copySync(
    //   path.resolve(files.EXTENSION_DESCRIPTOR_FILENAME),
    //   path.resolve(
    //     __dirname,
    //     '../../..',
    //     'public',
    //     'clientFiles',
    //     files.EXTENSION_DESCRIPTOR_FILENAME
    //   )
    // );
    //
    // // TODO: doing this makes it so you have to "trust it will be there" upon import
    // fsExtra.copySync(
    //   path.resolve(files.EXTENSION_DESCRIPTOR_FILENAME),
    //   path.resolve(__dirname, '../..', 'clientFiles', files.EXTENSION_DESCRIPTOR_FILENAME)
    // );
    const descriptorPath = path.resolve(files.EXTENSION_DESCRIPTOR_FILENAME);
    // When the extension descriptor changes while node is running, we want the updated version.
    delete require.cache[descriptorPath];
    return require(descriptorPath);
  } catch (e) {
    if (e.code === 'MODULE_NOT_FOUND') {
      throw new Error('You must create an extension.json before using the sandbox.');
    } else {
      throw e;
    }
  }
};
