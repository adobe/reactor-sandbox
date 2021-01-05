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

/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */

const path = require('path');
const extensionDescriptorPaths = require('./extensionDescriptorPaths');

module.exports = (platform) => {
  // We have all the logic inside the function because we want to give
  // the most current data from inside the descriptors each time the function is called.
  const extensionDescriptors = {};

  extensionDescriptorPaths.forEach((extensionDescriptorPath) => {
    const resolvedExtensionDescriptorPath = path.resolve(extensionDescriptorPath);
    delete require.cache[resolvedExtensionDescriptorPath];

    const extensionDescriptor = require(resolvedExtensionDescriptorPath);
    extensionDescriptor.extensionDescriptorPath = resolvedExtensionDescriptorPath;

    if (platform === extensionDescriptor.platform) {
      extensionDescriptors[extensionDescriptor.name] = extensionDescriptor;
    }
  });

  return extensionDescriptors;
};
