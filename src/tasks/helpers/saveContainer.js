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

const fs = require('fs');
const path = require('path');
const files = require('../constants/files');
const beautify = require('js-beautify').js_beautify;
const getExtensionDescriptors = require('./getExtensionDescriptors');
const extensionDescriptors = getExtensionDescriptors();
const mkdirp = require('mkdirp');
const LIBRARY_LOADED_LIB_PATH = 'core/src/lib/events/libraryLoaded.js';
const PAGE_BOTTOM_LIB_PATH = 'core/src/lib/events/pageBottom.js';
let token = -1;
let filename = 0;

const generateToken = () => {
  token += 1;
  return `$\{reactor_sandbox_editor_${token}\}`;
};

const generateFilename = () => {
  filename += 1;
  return `file${filename}.js`;
};

const turbinePkg = require(path.resolve('node_modules/@adobe/reactor-turbine/package.json'));
const CONSUMER_CONTAINER_TEMPLATE_PATH = path.resolve(
  files.CONSUMER_CLIENT_SRC_PATH,
  files.CONTAINER_FILENAME
);

const getValueFromObject = (obj, propertyPath) => {
  propertyPath.forEach(key => {
    if (!obj[key]) {
      return null;
    }

    obj = obj[key];
  });

  return obj;
};

const setValueToObject = (obj, propertyPath, value) => {
  let parentObj = null;
  let parentKey = null;
  propertyPath.forEach(key => {
    if (!obj[key]) {
      return;
    }

    parentObj = obj;
    parentKey = key;
    obj = obj[key];
  });

  parentObj[parentKey] = value;
};

const functionTransform = (transformData, fnCode) => {
  return `function(${transformData.parameters.join(', ')}) {${fnCode}}`;
};

const generateFunctionTransformReplacements = (
  transformData,
  propertyPath,
  containerConfig,
  replacements
) => {
  propertyPath = propertyPath.concat(transformData.propertyPath.split('.'));
  const replacementToken = generateToken();

  replacements[replacementToken] = functionTransform(
    transformData,
    getValueFromObject(containerConfig, propertyPath)
  );

  setValueToObject(containerConfig, propertyPath, replacementToken);
};

const fileTransform = (transformData, fileContent) => {
  const filename = generateFilename();

  mkdirp.sync(`${files.CONSUMER_CLIENT_SRC_PATH}/files`);
  fs.writeFileSync(`${files.CONSUMER_CLIENT_SRC_PATH}/files/${filename}`, fileContent);

  return `"/files/${filename}"`;
};

const generateFileTransformReplacements = (
  transformData,
  propertyPath,
  containerConfig,
  replacements
) => {
  propertyPath = propertyPath.concat(transformData.propertyPath.split('.'));
  const replacementToken = generateToken();

  replacements[replacementToken] = fileTransform(
    transformData,
    getValueFromObject(containerConfig, propertyPath)
  );

  setValueToObject(containerConfig, propertyPath, replacementToken);
};

const customTransform = (transformData, fileContent) => {
  const fileName = `/files/${generateFilename()}`;
  fileContent = `_satellite.__registerScript("${fileName}", "${fileContent}");`;

  mkdirp.sync(`${files.CONSUMER_CLIENT_SRC_PATH}/files`);
  fs.writeFileSync(`${files.CONSUMER_CLIENT_SRC_PATH}/${fileName}`, fileContent);

  return `"${fileName}"`;
};

const generateCustomTransformReplacements = (
  transformData,
  propertyPath,
  containerConfig,
  replacements
) => {
  if (propertyPath[0] !== 'rules') {
    return;
  }

  const rulePropertyPath = propertyPath.slice(0, 2);
  const rule = getValueFromObject(containerConfig, rulePropertyPath);
  const isExternalRule =
    rule.events.filter(
      e => [LIBRARY_LOADED_LIB_PATH, PAGE_BOTTOM_LIB_PATH].indexOf(e.modulePath) !== -1
    ).length > 0;

  if (!isExternalRule) {
    return;
  }

  propertyPath = propertyPath.concat(transformData.propertyPath.split('.'));
  const replacementToken = generateToken();

  replacements[replacementToken] = customTransform(
    transformData,
    getValueFromObject(containerConfig, propertyPath)
  );

  setValueToObject(containerConfig, propertyPath, replacementToken);

  const delegateSettings = getValueFromObject(containerConfig, propertyPath.slice(0, -1));
  delegateSettings.isExternal = true;
};

const generateTransformReplacements = (
  transformData,
  propertyPath,
  containerConfig,
  replacements
) => {
  switch (transformData.type) {
    case 'function':
      generateFunctionTransformReplacements(
        transformData,
        propertyPath,
        containerConfig,
        replacements
      );
      break;
    case 'file':
      generateFileTransformReplacements(transformData, propertyPath, containerConfig, replacements);
      break;
    case 'customCode':
      generateCustomTransformReplacements(
        transformData,
        propertyPath,
        containerConfig,
        replacements
      );
      break;
  }
};

const getTransformsData = (type, delegateConfig) => {
  if (delegateConfig.modulePath) {
    const modulePathParts = delegateConfig.modulePath.split('/');
    const extensionName = modulePathParts.shift();
    const modulePath = modulePathParts.join('/');

    if (extensionName === 'sandbox') {
      return null;
    }

    const descriptors = extensionDescriptors[extensionName][type];
    return descriptors.filter(delegateDescriptor => delegateDescriptor.libPath === modulePath)[0]
      .transforms;
  } else {
    const extensionKey = Object.keys(extensionDescriptors).filter(
      k => extensionDescriptors[k].displayName === delegateConfig.displayName
    )[0];
    return extensionDescriptors[extensionKey].configuration.transforms;
  }
};

const generateDelegateReplacements = (
  delegateConfig,
  type,
  propertyPath,
  containerConfig,
  replacements
) => {
  const transformsData = getTransformsData(type, delegateConfig);
  if (!transformsData) {
    return;
  }

  transformsData.forEach(transformData =>
    generateTransformReplacements(transformData, propertyPath, containerConfig, replacements)
  );
};

const generateReplacements = (entity, type, propertyPath, containerConfig, replacements) => {
  let delegateConfig;
  if (type !== 'rules') {
    propertyPath.push('settings');

    generateDelegateReplacements(entity, type, propertyPath, containerConfig, replacements);
  } else {
    ['events', 'conditions', 'actions'].forEach((delegateType, i) => {
      (entity[delegateType] || []).forEach(delegateConfig => {
        let delegatePropertyPath = propertyPath.slice(0);
        delegatePropertyPath.push(delegateType, i, 'settings');

        generateDelegateReplacements(
          delegateConfig,
          delegateType,
          delegatePropertyPath,
          containerConfig,
          replacements
        );
      });
    });
  }
};

const generateTransformsData = config => {
  const replacements = {};

  ['dataElements', 'rules', 'extensions'].forEach(type => {
    Object.keys(config[type]).forEach(delegateConfigKey =>
      generateReplacements(
        config[type][delegateConfigKey],
        type,
        [type, delegateConfigKey],
        config,
        replacements
      )
    );
  });

  return {
    config: config,
    replacements: replacements
  };
};

const replaceTokens = (content, replacements) => {
  Object.keys(replacements).forEach(key => {
    content = content.replace(`"${key}"`, replacements[key]);
  });

  return content;
};

module.exports = config => {
  token = -1;
  filename = 0;

  config = Object.assign(config, {
    buildInfo: {
      turbineVersion: turbinePkg.version,
      turbineBuildDate: new Date().toISOString(),
      buildDate: new Date().toISOString(),
      environment: 'development'
    }
  });

  ({ config, replacements } = generateTransformsData(config));

  const fileContent = `module.exports = ${JSON.stringify(config)}`;

  fs.writeFileSync(
    CONSUMER_CONTAINER_TEMPLATE_PATH,
    /* eslint-disable-next-line camelcase */
    beautify(replaceTokens(fileContent, replacements), { indent_size: 2 })
  );
};
