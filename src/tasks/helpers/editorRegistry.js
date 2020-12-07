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

/* eslint-disable indent */
/* eslint-disable no-param-reassign */

const currentExtensionDescriptor = require('./getExtensionDescriptor')();

const populateComponentsType = (type, extDescriptor, registry) => {
  (extDescriptor[type] || []).forEach((component) => {
    registry.components[type][`${extDescriptor.name}/${component.libPath}`] = {
      extensionDisplayName: extDescriptor.displayName,
      extensionName: extDescriptor.name,
      displayName: component.displayName,
      libPath: component.libPath,
      viewPath: component.viewPath
        ? `extensionViews/${extDescriptor.name}/${extDescriptor.version}/${component.viewPath}`
        : null
    };
  });
};

const populateComponents = (extensionDescriptors, registry) => {
  Object.keys(extensionDescriptors).forEach((key) => {
    const extensionDescriptor = extensionDescriptors[key];
    ['events', 'conditions', 'actions', 'dataElements'].forEach((type) =>
      populateComponentsType(type, extensionDescriptor, registry)
    );
  });
};

const populateExtensionsData = (extensionDescriptors, registry) => {
  Object.keys(extensionDescriptors).forEach((key) => {
    const ed = extensionDescriptors[key];
    registry.extensions[ed.name] = {
      displayName: ed.displayName,
      name: ed.name,
      viewPath: (ed.configuration || {}).viewPath
        ? `extensionViews/${ed.name}/${ed.version}/${ed.configuration.viewPath}`
        : null
    };
  });
};

module.exports = (extensionDescriptorPaths, { platform }, { request, ports }) => {
  const registry = {
    currentExtensionName: currentExtensionDescriptor.name,
    environment: {
      server: {
        host: `${request.protocol}://${request.hostname}`,
        port: ports[request.protocol]
      }
    },
    components: {
      events:
        platform === 'edge'
          ? {}
          : {
              'sandbox/pageTop.js': {
                extensionDisplayName: 'Sandbox',
                extensionName: 'sandbox',
                displayName: 'Page Top',
                libPath: 'pageTop.js'
              },
              'sandbox/click.js': {
                extensionDisplayName: 'Sandbox',
                extensionName: 'sandbox',
                displayName: 'Click',
                libPath: 'click.js'
              }
            },
      conditions: {},
      actions:
        platform === 'edge'
          ? {
              'sandbox/customCode.js': {
                extensionDisplayName: 'Sandbox',
                extensionName: 'sandbox',
                displayName: 'Custom Code',
                libPath: 'customCode.js',
                viewPath: '/customCode.html'
              }
            }
          : {
              'sandbox/logEventInfo.js': {
                extensionDisplayName: 'Sandbox',
                extensionName: 'sandbox',
                displayName: 'Log Event Info',
                libPath: 'logEventInfo.js'
              }
            },
      dataElements:
        platform === 'edge'
          ? {
              'sandbox/constant.js': {
                extensionDisplayName: 'Sandbox',
                extensionName: 'sandbox',
                displayName: 'Constant',
                libPath: 'constant.js',
                viewPath: '/constant.html'
              },
              'sandbox/path.js': {
                extensionDisplayName: 'Sandbox',
                extensionName: 'sandbox',
                displayName: 'Path',
                libPath: 'path.js',
                viewPath: '/path.html'
              }
            }
          : {
              'sandbox/localStorage.js': {
                extensionDisplayName: 'Sandbox',
                extensionName: 'sandbox',
                displayName: 'Local Storage',
                libPath: 'localStorage.js',
                viewPath: '/localStorage.html'
              },
              'sandbox/javascriptVariable.js': {
                extensionDisplayName: 'Sandbox',
                extensionName: 'sandbox',
                displayName: 'JavaScript Variable',
                libPath: 'javascriptVariable.js',
                viewPath: '/javascriptVariable.html'
              }
            }
    },
    extensions: {}
  };

  populateComponents(extensionDescriptorPaths, registry);
  populateExtensionsData(extensionDescriptorPaths, registry);
  return registry;
};
