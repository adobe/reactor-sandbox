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

const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const { EXTENSION_DESCRIPTOR_FILENAME } = require('../constants/files');
const isSandboxLinked = require('../../helpers/isSandboxLinked');

// We are searching for any extension folder that exists in `node_modules` (scoped or unscoped)
let extensionJsonPaths = glob.sync(
  `{node_modules/*/,node_modules/@*/*/,}${EXTENSION_DESCRIPTOR_FILENAME}`
);

// When sandbox is linked, the core extensions will be accessible at a
// different path than the ones from above. We could use one glob regex to find all the cases,
// but it may be really slow if we use something like `node_modules/@*/**/*`.
if (isSandboxLinked()) {
  const b = 'node_modules/@adobe/reactor-sandbox';
  extensionJsonPaths = extensionJsonPaths.concat(
    glob.sync(`{${b}/node_modules/*/,${b}/node_modules/@*/*/}${EXTENSION_DESCRIPTOR_FILENAME}`, {
      follow: true
    })
  );
}

function getExtensionPlatform(filePath) {
  const fileContents = JSON.parse(fs.readFileSync(path.resolve(filePath)));
  if (!fileContents.platform) {
    throw new Error(
      `Unable to detect the platform the development
      extension is targeting for path "${filePath}"`
    );
  }
  return fileContents.platform;
}

// if there's only 1 path, skip over this logic
if (extensionJsonPaths.length > 1) {
  // Order the paths so that `extension.json` is last in the array. We do this because
  // we may use the sandbox when we develop the core extension. We will be in a situation where
  // the core extension has sandbox as a dependency. And the sandbox has the core extension
  // as a dependency (Core -> Sandbox -> Core). We want to load the core extension that has the
  // sandbox as a dependency (meaning we want the extension with extension.json path to always win).
  extensionJsonPaths.sort((a, b) => {
    if (a === EXTENSION_DESCRIPTOR_FILENAME) {
      return 1;
    }

    if (b === EXTENSION_DESCRIPTOR_FILENAME) {
      return -1;
    }

    return 0;
  });

  const extensionPlatform = getExtensionPlatform(extensionJsonPaths[extensionJsonPaths.length - 1]);

  // Remove duplicate paths and paths that aren't of the same platform as the extension
  // that's launching the sandbox¸
  extensionJsonPaths = extensionJsonPaths.filter((filePath, index, self) => {
    return Boolean(
      self.indexOf(filePath) === index && getExtensionPlatform(filePath) === extensionPlatform
    );
  });
}

module.exports = extensionJsonPaths;
