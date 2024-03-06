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

const getExtensionDescriptor = require('./getExtensionDescriptor');

module.exports =
  (getDefaultInitInfo) =>
  async (type, name = null) => {
    const extensionDescriptor = getExtensionDescriptor();
    let descriptor;
    if (type === 'configuration') {
      descriptor = extensionDescriptor.configuration;
    } else if (Array.isArray(extensionDescriptor[type])) {
      descriptor = extensionDescriptor[type].find((d) => d.name === name);
    }
    if (!descriptor) {
      throw new Error(`Descriptor ${type}/${name} not found in extension.json`);
    }

    let info = {
      settings: null,
      propertySettings: {
        id: 'PR12345',
        domains: ['adobe.com', 'example.com'],
        undefinedVarsReturnEmpty: false
      },
      tokens: {
        imsAccess: 'X34DF56GHHBBFFGH'
      },
      company: {
        orgId: 'ABCDEFGHIJKLMNOPQRSTUVWX@AdobeOrg'
      },
      apiEndpoints: {
        reactor: '//localhost'
      },
      schema: descriptor?.schema || null
    };

    if (type !== 'configuration') {
      const { settings, ...rest } = info;
      info = {
        settings,
        extensionSettings: {
          foo: 'bar'
        },
        ...rest
      };
    }

    if (getDefaultInitInfo) {
      return getDefaultInitInfo({ info, type, name });
    }
    return info;
  };
