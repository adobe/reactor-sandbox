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
/* eslint-disable no-prototype-builtins */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */

const fs = require('fs-extra');
const path = require('path');
const beautify = require('js-beautify').js_beautify;
const turbinePkg = require('@adobe/reactor-turbine/package.json');

const files = require('../constants/files');
const stringifyWithReplacements = require('./stringifyWithReplacements');
const runTransforms = require('./runTransforms');
const augmentExtensions = require('./augmentExtensions');
const { LAUNCH_ENVIRONMENT_NAME } = require('../../client/constants');

const DEFAULT_CONTAINER_TEMPLATE_PATH = path.resolve(
  files.INIT_FILES_SRC_PATH,
  files.CONTAINER_FILENAME
);

const CONSUMER_CONTAINER_TEMPLATE_PATH = path.resolve(
  files.CONSUMER_PROVIDED_FILES_PATH,
  files.CONTAINER_FILENAME
);

module.exports = (options = {}) => {
  const { container: containerOption } = options;
  // When running this task from a turbine extension project we want to include the
  // extension descriptor from that extension as well as any extensions we find under its
  // node_modules.
  // When running this task from within this builder project we care about any extensions we find
  // under this project's node_modules or under a folder starting with @(as for npm scopes).
  let container;

  if (containerOption) {
    container = containerOption;
  } else {
    // Try to use the consumer-defined container first and fallback to the default if they haven't
    // provided one.
    try {
      // Make sure we get the latest.
      delete require.cache[CONSUMER_CONTAINER_TEMPLATE_PATH];
      container = require(CONSUMER_CONTAINER_TEMPLATE_PATH);
    } catch (error) {
      if (error.code === 'MODULE_NOT_FOUND') {
        // Make sure we get the latest.
        delete require.cache[DEFAULT_CONTAINER_TEMPLATE_PATH];
        container = require(DEFAULT_CONTAINER_TEMPLATE_PATH);
      }
    }
  }

  // Add the buildInfo to the container
  container = Object.assign(container, {
    buildInfo: {
      turbineVersion: turbinePkg.version,
      turbineBuildDate: new Date().toISOString(),
      buildDate: new Date().toISOString()
    },
    // TODO: put this in the container template and make it editable from the UI
    environment: {
      id: LAUNCH_ENVIRONMENT_NAME,
      stage: 'development'
    }
  });

  const externalFiles = runTransforms(container);
  augmentExtensions(container);
  const containerJavascript = stringifyWithReplacements(container);

  const setContainerJavascript = `${
    '' +
    '(function() {\n' +
    '  window._satellite = window._satellite || {};\n' +
    '  window._satellite.container = '
  }${containerJavascript}\n})();`;

  const turbine = fs.readFileSync(files.TURBINE_ENGINE_PATH);
  return {
    [`/${files.LAUNCH_LIBRARY_FILENAME}`]:
      // eslint-disable-next-line camelcase
      beautify(setContainerJavascript, { indent_size: 2 }) + turbine,
    ...externalFiles
  };
};
