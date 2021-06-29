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

/* eslint-disable no-prototype-builtins */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */

const { transform } = require('@babel/core');
const pkgDir = require('pkg-dir');
const path = require('path');
const files = require('../constants/files');
const extensionDescriptorPaths = require('./extensionDescriptorPaths');

const FEATURE_TYPES = ['conditions', 'actions', 'dataElements'];

let container;

const functionTokenRegistry = {
  _tokenIdCounter: 0,
  _functionStrByToken: {},
  FUNCTION_TOKEN_REGEX: /"\{\{sandbox:function:(.+?)\}\}"/g,
  getToken(functionStr) {
    // eslint-disable-next-line no-plusplus
    const tokenId = ++this._tokenIdCounter;
    this._functionStrByToken[tokenId] = functionStr;
    return `{{sandbox:function:${tokenId}}}`;
  },
  getFunctionStr(tokenId) {
    return this._functionStrByToken[tokenId];
  }
};

const augmentSandboxModules = (modulesOutput) => {
  modulesOutput['sandbox/constant.js'] = {
    displayName: 'Constant',
    name: 'constant',
    extensionName: 'sandbox',
    script: ({ utils: { getSettings } }) => getSettings().path
  };
};

const augmentModule = (modulesOutput, extensionName, extensionPath, modulePath, moduleMeta) => {
  // The reference path is a unique path that starts with the extension name, then a slash,
  // then the path to the file within the extension's directory.
  // On Windows, the path contains `\` instead of `/`, so we do a global replace at the end.
  const referencePath = path
    .join(extensionName, path.relative(extensionPath, modulePath))
    .replace(/\\/g, '/');

  // It's possible this module has already been added to the output. If it has, we just need to
  // merge any new meta information that hasn't already been stored for the module. This supports
  // certain cases where a module could be an action delegate AND required via relative path
  // by an event delegate AND be a shared module.
  let moduleOutput = modulesOutput[referencePath];

  if (!moduleOutput) {
    moduleOutput = {
      // We use a special token that indicates that after the container is serialized
      // to JSON that the token should be replaced with an actual, executable function
      // which wraps the delegate code. We can't just set the value to a function right
      // now because it wouldn't be properly serialized.
      script: functionTokenRegistry.getToken(`require('${modulePath}')`)
    };
    modulesOutput[referencePath] = moduleOutput;
  }

  // Merge meta information.
  Object.keys(moduleMeta).forEach((key) => {
    if (!moduleOutput.hasOwnProperty(key)) {
      moduleOutput[key] = moduleMeta[key];
    }
  });
};

const augmentModules = (modulesOutput, extensionDescriptor, extensionPath) => {
  modulesOutput = modulesOutput || {};

  FEATURE_TYPES.forEach((featureType) => {
    if (extensionDescriptor.hasOwnProperty(featureType)) {
      let featureDescriptors = extensionDescriptor[featureType];

      if (typeof featureDescriptors === 'string') {
        featureDescriptors = [
          {
            libPath: featureDescriptors
          }
        ];
      }

      if (featureDescriptors) {
        featureDescriptors.forEach((featureDescriptor) => {
          // Mobile extensions don't have library modules.
          if (!featureDescriptor.libPath) {
            return;
          }

          const modulePath = path
            .join(extensionPath, extensionDescriptor.libBasePath || '', featureDescriptor.libPath)
            .replace(/\\/g, '/');

          const moduleMeta = {
            extensionName: extensionDescriptor.name
          };

          if (featureDescriptor.name) {
            moduleMeta.name = featureDescriptor.name;
          }

          if (featureType === 'sharedModules') {
            moduleMeta.shared = true;
          }

          if (featureDescriptor.displayName) {
            moduleMeta.displayName = featureDescriptor.displayName;
          }

          augmentModule(
            modulesOutput,
            extensionDescriptor.name,
            extensionPath,
            modulePath,
            moduleMeta
          );
        });
      }
    }
  });
};

module.exports = () => {
  const containerPath = path.resolve(files.CONSUMER_PROVIDED_FILES_PATH, files.CONTAINER_FILENAME);
  delete require.cache[containerPath];
  try {
    container = require(containerPath);
  } catch (e) {
    container = {};
  }

  const extensionsOutput = {
    sandbox: { displayName: 'Sandbox' },
    ...container.extensions
  };
  const modulesOutput = {};
  container.extensions = extensionsOutput;
  container.modules = modulesOutput;

  extensionDescriptorPaths.forEach((extensionDescriptorPath) => {
    const extensionDescriptor = require(path.resolve(extensionDescriptorPath));
    const extensionPath = path.dirname(path.resolve(extensionDescriptorPath));

    // We take care to not just overwrite extensionsOutput[extensionDescriptor.name] because
    // Extension A may be pulled in from node_modules AND the extension developer using the
    // sandbox may have already coded in some stuff for Extension A within their container.js
    // template. This is a common use case when an extension developer wants to test a certain
    // extension configuration.
    let extensionOutput = extensionsOutput[extensionDescriptor.name];

    if (!extensionOutput) {
      extensionOutput = {};
      extensionsOutput[extensionDescriptor.name] = extensionOutput;
    }

    extensionOutput.displayName = extensionOutput.displayName || extensionDescriptor.displayName;

    augmentModules(modulesOutput, extensionDescriptor, extensionPath);
  });

  augmentSandboxModules(modulesOutput);

  // Stringify the container so we can wrap it with some additional code (see down below).
  container = JSON.stringify(
    container,
    (key, value) => {
      // When consumers have placed functions in their container, we need to maintain them as
      // executable functions in the final output. Consumers may place functions in their container
      // in order to simulate the "function" transform that typically occurs on the server.
      if (typeof value === 'function') {
        return functionTokenRegistry.getToken(value.toString());
      }

      return value;
    },
    2
  );

  // Replace all function tokens in the JSON with executable functions.
  container = container.replace(functionTokenRegistry.FUNCTION_TOKEN_REGEX, (token, tokenId) => {
    return functionTokenRegistry.getFunctionStr(tokenId);
  });

  const babelPluginDir = pkgDir.sync(
    require.resolve('@adobe/reactor-babel-plugin-replace-tokens-edge')
  );

  container = transform(`container = (getDataElementValues) => (${container})`, {
    plugins: [babelPluginDir]
  }).code;

  // eslint-disable-next-line no-eval
  eval(container);

  // eslint-disable-next-line no-unused-vars
  return container;
};
