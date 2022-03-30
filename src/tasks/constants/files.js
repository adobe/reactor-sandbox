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

const path = require('path');
const { LAUNCH_ENVIRONMENT_NAME } = require('../../client/constants');

const ENGINE_FILENAME = 'engine.js';
const INIT_FILES_SRC_PATH = path.resolve(__dirname, '../../client/initFiles');
const SANDBOX_EXTENSION_SRC_PATH = path.resolve(__dirname, '../../client/sandboxExtension');
const EXTENSION_BRIDGE = 'extensionbridge.min.js';
const EXTENSION_BRIDGE_CHILD = 'extensionbridge-child.js';
const EXTENSION_BRIDGE_PATH = path.join(require.resolve('@adobe/reactor-bridge'), '../../dist/');

const files = {
  EXTENSION_DESCRIPTOR_FILENAME: 'extension.json',
  EXTENSION_DESCRIPTOR_SCRIPT_FILENAME: 'extensionDescriptor',
  INIT_FILES_SRC_PATH,
  SANDBOX_EXTENSION_SRC_PATH,
  CONSUMER_PROVIDED_FILES_PATH: path.resolve('.sandbox'),
  CONTAINER_FILENAME: 'container.js',
  ENGINE_FILENAME: 'engine.js',
  LAUNCH_LIBRARY_FILENAME: `launch-${LAUNCH_ENVIRONMENT_NAME}.js`,
  TURBINE_ENGINE_PATH: require.resolve(`@adobe/reactor-turbine/dist/${ENGINE_FILENAME}`),
  VIEW_SANDBOX_HTML_FILENAME: 'viewSandbox.html',
  LIB_SANDBOX_HTML_FILENAME: 'libSandbox.html',
  LIB_SANDBOX_ERROR_FILENAME: 'libSandboxError.html',
  EXTENSION_VIEWS_DIRNAME: 'extensionViews',
  EXTENSION_BRIDGE,
  EXTENSION_BRIDGE_CHILD,
  EXTENSION_BRIDGE_PATH,
  EXTENSION_BRIDGE_CHILD_PATH: path.join(EXTENSION_BRIDGE_PATH, EXTENSION_BRIDGE_CHILD)
};

module.exports = files;
