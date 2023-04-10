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

const fs = require('fs');
const path = require('path');
const matchRequires = require('match-requires');
const extensionDescriptorPaths = require('./extensionDescriptorPaths');
const Replacement = require('./Replacement');

const FEATURE_TYPES = ['events', 'conditions', 'actions', 'dataElements', 'sharedModules', 'main'];

const wrapInFunction = (content, argNames) => {
  const argsStr = argNames ? argNames.join(', ') : '';
  return `function(${argsStr}) {\n${content}\n}\n`;
};

const augmentModule = (modulesOutput, extensionName, extensionPath, modulePath, moduleMeta) => {
  const source = fs.readFileSync(modulePath, { encoding: 'utf8' });
  matchRequires(source, true)
    // matchRequires returns objects with some cruft. We just care about the module paths.
    .map((result) => result.name)
    // Only care about relative paths. We don't care about require statements for core modules.
    .filter((module) => module.indexOf('.') === 0)
    // Allow extension devs to require JS files without the js extension
    .map((module) => (path.extname(module) === '.js' ? module : `${module}.js`))
    .forEach((requiredRelativePath) => {
      const requiredPath = path.resolve(path.dirname(modulePath), requiredRelativePath);
      augmentModule(modulesOutput, extensionName, extensionPath, requiredPath, {});
    });

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
      script: new Replacement(wrapInFunction(source, ['module', 'exports', 'require', 'turbine']))
    };
    modulesOutput[referencePath] = moduleOutput;
  }

  // Merge meta information.
  Object.keys(moduleMeta).forEach((key) => {
    if (!Object.prototype.hasOwnProperty.call(moduleOutput, key)) {
      moduleOutput[key] = moduleMeta[key];
    }
  });
};

const augmentModules = (extensionOutput, extensionDescriptor, extensionPath) => {
  extensionOutput.modules = extensionOutput.modules || {};

  FEATURE_TYPES.forEach((featureType) => {
    if (Object.prototype.hasOwnProperty.call(extensionDescriptor, featureType)) {
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

          const modulePath = path.join(
            extensionPath,
            extensionDescriptor.libBasePath || '',
            featureDescriptor.libPath
          );

          const moduleMeta = {};

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
            extensionOutput.modules,
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

/**
 * Adds a Sandbox extension to the container with some simple events that sandbox users can use in
 * their rules.
 */
const augmentSandboxEvents = (extensionsOutput) => {
  if (!extensionsOutput.sandbox) {
    // Check to see if the extension under test is named sandbox.
    extensionsOutput.sandbox = {
      displayName: 'Extension Sandbox',
      modules: {
        // These modules are provided to users for their convenience.
        'sandbox/click.js': {
          displayName: 'Click',
          name: 'click',
          script: (module) => {
            module.exports = (settings, trigger) => {
              document.addEventListener('click', (event) => {
                trigger({
                  nativeEvent: event
                });
              });
            };
          }
        },
        'sandbox/pageTop.js': {
          displayName: 'Page Top',
          name: 'page-top',
          script: (module) => {
            module.exports = (settings, trigger) => {
              trigger();
            };
          }
        },
        'sandbox/logEventInfo.js': {
          displayName: 'Log Event Info',
          name: 'log-event-info',
          script: (module) => {
            module.exports = (settings, event) => {
              // eslint-disable-next-line no-console
              console.log('Event object received by action:', event);
            };
          }
        },
        'sandbox/localStorage.js': {
          script: (module) => {
            module.exports = (settings) => {
              // When local storage is disabled on Safari, the mere act of referencing
              // window.localStorage throws an error. For this reason, referencing
              // window.localStorage without being inside a try-catch should be avoided.
              try {
                return window.localStorage.getItem(settings.name);
              } catch (e) {
                return null;
              }
            };
          }
        },
        'sandbox/javascriptVariable.js': {
          script: (module) => {
            module.exports = (settings) => {
              const propertyChain = settings.path.split('.');
              let currentValue = window;

              for (let i = 0, len = propertyChain.length; i < len; i += 1) {
                if (currentValue == null) {
                  return undefined;
                }

                currentValue = currentValue[propertyChain[i]];
              }

              return currentValue;
            };
          }
        }
      }
    };
  }
};

module.exports = (container) => {
  let extensionsOutput = container.extensions;

  if (!extensionsOutput) {
    extensionsOutput = {};
    container.extensions = extensionsOutput;
  }

  extensionDescriptorPaths.forEach((extensionDescriptorPath) => {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    const extensionDescriptor = require(path.resolve(extensionDescriptorPath));
    // eslint-disable-next-line global-require, import/no-dynamic-require
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
    extensionOutput.hostedLibFilesBaseUrl = `/hostedLibFiles/\
  ${extensionDescriptor.name}/${extensionDescriptor.version}/`;

    augmentModules(extensionOutput, extensionDescriptor, extensionPath);
  });

  augmentSandboxEvents(extensionsOutput);
};
