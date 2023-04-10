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

const { PLATFORMS } = require('../../helpers/sharedConstants');
const getExtensionDescriptor = require('./getExtensionDescriptor');
const getExtensionDescriptors = require('./getExtensionDescriptors');
const Replacement = require('./Replacement');

const { platform } = getExtensionDescriptor();
const extensionDescriptors = getExtensionDescriptors(platform);
const LIBRARY_LOADED_LIB_PATH = 'core/src/lib/events/libraryLoaded.js';
const PAGE_BOTTOM_LIB_PATH = 'core/src/lib/events/pageBottom.js';

const addExternalFile = (content, externalFiles) => {
  const i = Object.keys(externalFiles).length + 1;
  const filename = `/files/file${i}.js`;
  externalFiles[filename] = typeof content === 'function' ? content(filename) : content;
  return filename;
};

const transformValueFromObject = (obj, propertyPath, transformCallback) => {
  let parentObj = null;
  let parentKey = null;

  for (let i = 0; i < propertyPath.length; i += 1) {
    const key = propertyPath[i];
    if (key === '[]' && Array.isArray(obj)) {
      if (i === propertyPath.length - 1) {
        // "[]" is the last part of the path, so we transform each item of the array
        parentObj[parentKey] = obj.map(transformCallback);
      } else {
        const restOfPath = propertyPath.slice(i + 1);
        obj.forEach((item) => {
          transformValueFromObject(item, restOfPath, transformCallback);
        });
      }
      return;
    }
    if (!obj[key]) {
      return;
    }

    parentObj = obj;
    parentKey = key;
    obj = obj[key];
  }

  parentObj[parentKey] = transformCallback(obj);
};

// Does not support array type property paths (i.e. property paths with "[]" in them).
const getValueFromObject = (obj, propertyPath) => {
  for (let i = 0; i < propertyPath.length; i += 1) {
    const key = propertyPath[i];
    if (!obj[key]) {
      return null;
    }

    obj = obj[key];
  }

  return obj;
};

// Does not support array type property paths (i.e. property paths with "[]" in them).
const setValueToObject = (obj, propertyPath, value) => {
  let parentObj = null;
  let parentKey = null;

  for (let i = 0; i < propertyPath.length; i += 1) {
    const key = propertyPath[i];
    if (!obj[key]) {
      return false;
    }

    parentObj = obj;
    parentKey = key;
    obj = obj[key];
  }

  parentObj[parentKey] = value;

  return true;
};

const deleteValueFromObject = (obj, propertyPath) => {
  let parentObj = null;
  let parentKey = null;

  for (let i = 0; i < propertyPath.length; i += 1) {
    const key = propertyPath[i];
    if (key === '[]' && Array.isArray(obj)) {
      if (i === obj.length - 1) {
        // "[]" is the last part of the path, so we delete each item of the array
        // leaving us with just an empty array. We could recurse here, but
        // deleteValueFromObject doesn't handle deleting the top level item.
        parentObj[parentKey] = [];
        return true;
      }
      // there is more beyond the "[]", so we need to delete the property from
      // each item in the array.
      const restOfPath = propertyPath.slice(i + 1);
      obj.forEach((item) => {
        deleteValueFromObject(item, restOfPath);
      });
      return true;
    }
    if (!obj[key]) {
      return false;
    }

    parentObj = obj;
    parentKey = key;
    obj = obj[key];
  }

  delete parentObj[parentKey];

  return true;
};

const executeFunctionTransform = (transformData, propertyPath, containerConfig) => {
  propertyPath = propertyPath.concat(transformData.propertyPath.split('.'));
  transformValueFromObject(containerConfig, propertyPath, (functionContent) => {
    return new Replacement(
      `function(${transformData.parameters.join(', ') || []}) {${functionContent}}`
    );
  });
};

const executeFileTransform = (transformData, propertyPath, containerConfig, externalFiles) => {
  propertyPath = propertyPath.concat(transformData.propertyPath.split('.'));
  transformValueFromObject(containerConfig, propertyPath, (fileContent) => {
    return addExternalFile(fileContent, externalFiles);
  });
};

// Custom code transforms are only done by custom code actions. These transforms
// do not use array type property paths so we don't need to worry about using
// transformValueFromObject.
const executeCustomCodeTransform = (
  transformData,
  propertyPath,
  containerConfig,
  externalFiles
) => {
  if (propertyPath[0] !== 'rules') {
    return;
  }

  const rulePropertyPath = propertyPath.slice(0, 2);
  const rule = getValueFromObject(containerConfig, rulePropertyPath);
  // Custom code actions are external if they could be triggered by an
  // event other than the library loaded or page bottom events.
  const isExternalRule =
    (rule.events || []).filter(
      (e) => [LIBRARY_LOADED_LIB_PATH, PAGE_BOTTOM_LIB_PATH].indexOf(e.modulePath) === -1
    ).length > 0;

  if (!isExternalRule) {
    return;
  }

  propertyPath = propertyPath.concat(transformData.propertyPath.split('.'));
  const customTransformContent = getValueFromObject(containerConfig, propertyPath);
  const fileName = addExternalFile((f) => {
    return `_satellite.__registerScript("${f}", "${customTransformContent.replace(/\s/g, '')}");`;
  }, externalFiles);
  setValueToObject(containerConfig, propertyPath, fileName);

  const delegateSettings = getValueFromObject(containerConfig, propertyPath.slice(0, -1));
  delegateSettings.isExternal = true;
};

const executeRemoveTransform = (transformData, propertyPath, containerConfig) => {
  propertyPath = propertyPath.concat(transformData.propertyPath.split('.'));
  deleteValueFromObject(containerConfig, propertyPath);
};

const executeTransform = (transformData, propertyPath, containerConfig, externalFiles) => {
  switch (transformData.type) {
    case 'remove':
      executeRemoveTransform(transformData, propertyPath, containerConfig);
      break;
    case 'function':
      executeFunctionTransform(transformData, propertyPath, containerConfig);
      break;
    case 'file':
      executeFileTransform(transformData, propertyPath, containerConfig, externalFiles);
      break;
    // custom code actions have customCode as a transform type
    case 'customCode':
      executeCustomCodeTransform(transformData, propertyPath, containerConfig, externalFiles);
      break;
    default:
      break;
  }
};

const getTransformsData = (type, delegateConfig) => {
  if (delegateConfig.modulePath) {
    const modulePathParts = delegateConfig.modulePath.split('/');
    const extensionName = modulePathParts.shift();
    const modulePath = modulePathParts.join('/');

    if (extensionName === 'sandbox') {
      if (platform === PLATFORMS.EDGE && delegateConfig.modulePath === 'sandbox/customCode.js') {
        return [
          {
            type: 'function',
            propertyPath: 'code',
            parameters: ['arc', 'utils']
          }
        ];
      }
      return null;
    }

    const descriptors = extensionDescriptors[extensionName][type];
    return descriptors.filter((delegateDescriptor) => delegateDescriptor.libPath === modulePath)[0]
      .transforms;
  }
  const extensionKey = Object.keys(extensionDescriptors).filter(
    (k) => extensionDescriptors[k].displayName === delegateConfig.displayName
  )[0];
  return extensionDescriptors[extensionKey].configuration.transforms;
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

  transformsData.forEach((transformData) =>
    executeTransform(transformData, propertyPath, containerConfig, replacements)
  );
};

const generateReplacements = (entity, type, propertyPath, containerConfig, replacements) => {
  if (type !== 'rules') {
    propertyPath.push('settings');

    generateDelegateReplacements(entity, type, propertyPath, containerConfig, replacements);
  } else {
    ['events', 'conditions', 'actions'].forEach((delegateType) => {
      (entity[delegateType] || []).forEach((delegateConfig, i) => {
        const delegatePropertyPath = propertyPath.slice(0);
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

// Mutates the config object according to the transforms defined in the active
// extensions' manifests. Returns an map containing the external files that
// need to be created. (The key is the file name and the value is the contents.)
module.exports = (config) => {
  const replacements = {};
  const externalFiles = {};

  ['dataElements', 'rules', 'extensions'].forEach((type) => {
    Object.keys(config[type]).forEach((delegateConfigKey) =>
      generateReplacements(
        config[type][delegateConfigKey],
        type,
        [type, delegateConfigKey],
        config,
        replacements,
        externalFiles
      )
    );
  });

  return externalFiles;
};
