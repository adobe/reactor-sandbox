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

import Promise from 'native-promise-only-ponyfill';
import { loadIframe, setPromise, setDebug } from '@adobe/reactor-bridge';
import Ajv from 'ajv';
import Split from 'split.js';
import deepEqual from 'deep-equal';

setPromise(Promise);
// setDebug(true);

const VIEW_GROUPS = {
  CONFIGURATION: 'configuration',
  EVENTS: 'events',
  CONDITIONS: 'conditions',
  ACTIONS: 'actions',
  DATA_ELEMENTS: 'dataElements'
};

const viewGroupOptionDescriptors = [
  {
    value: VIEW_GROUPS.CONFIGURATION,
    label: 'Extension Configuration'
  },
  {
    value: VIEW_GROUPS.EVENTS,
    label: 'Events'
  },
  {
    value: VIEW_GROUPS.CONDITIONS,
    label: 'Conditions'
  },
  {
    value: VIEW_GROUPS.ACTIONS,
    label: 'Actions'
  },
  {
    value: VIEW_GROUPS.DATA_ELEMENTS,
    label: 'Data Elements'
  }
];

const NOT_AVAILABLE = '--N/A--';
const OTHER = 'Other';

const codeMirrorConfig = {
  lineNumbers: true,
  mode: 'application/json',
  gutters: ['CodeMirror-lint-markers'],
  lint: true,
  value: '{}',
  extraKeys: {
    'Tab': cm => {
      cm.replaceSelection('  ' , 'end');
    }
  }
};

const clearSelectOptions = comboBox => comboBox.innerHTML = '';

const openCodeEditor = () =>
  Promise.resolve('Edited Code ' + Math.round(Math.random() * 10000));

const openRegexTester = () =>
  Promise.resolve('Edited Regex ' + Math.round(Math.random() * 10000));

const openDataElementSelector = (options = {}) => {
  let value = 'dataElement' + Math.round(Math.random() * 10000);
  // Tokenize by default. The tokenize option must be set explicitly to false to disable it.
  if (options.tokenize !== false) {
    value = `%${ value }%`;
  }
  return value;
};

const markAsDirty = () => {};

const getCategorizedItems = items => {
  var groupedItems = {};

  if (items) {
    items.forEach(item => {
      var categoryName = item.categoryName || NOT_AVAILABLE;
      if (!groupedItems[categoryName]) {
        groupedItems[categoryName] = [];
      }
      groupedItems[categoryName].push(item);
    });
  }

  Object.keys(groupedItems).forEach(categoryName => {
    groupedItems[categoryName].sort((a, b) => {
      if (a.displayName < b.displayName) {
        return -1;
      } else if (a.displayName > b.displayName) {
        return 1;
      } else {
        return 0;
      }
    });
  });

  return groupedItems;
};

const reportIframeCommsError = (error) => {
  alert('An error has occurred. Please see the browser console.');
  throw error;
};

const init = () => {
  const viewGroupSelector = document.getElementById('viewGroupSelector');
  const viewSelector = document.getElementById('extensionViewSelector');
  const validateButton = document.getElementById('validateButton');
  const validateOutput = document.getElementById('validateOutput');
  const initEditor =
    CodeMirror(document.getElementById('initEditorContainer'), codeMirrorConfig);
  const initButton = document.getElementById('initButton');
  const resetInitButton = document.getElementById('resetInitButton');
  const getSettingsEditor =
    CodeMirror(document.getElementById('getSettingsEditorContainer'), codeMirrorConfig);
  const getSettingsButton = document.getElementById('getSettingsButton');
  const copySettingsToInitButton = document.getElementById('copySettingsToInitButton');
  const extensionViewPane = document.getElementById('extensionViewPane');

  const lastSelectedView = localStorage.getItem('lastSelectedView');
  const lastSelectedViewGroup = localStorage.getItem('lastSelectedViewGroup');

  const populateViewSelector = () => {
    clearSelectOptions(viewSelector);
    const groupKey = viewGroupSelector.value;
    localStorage.setItem('lastSelectedViewGroup', groupKey);

    var categorizedItems = getCategorizedItems(extensionDescriptor[groupKey]);
    Object.keys(categorizedItems).sort((a, b) => {
      const categoriesToBePlacedLast = [NOT_AVAILABLE, OTHER];

      for (let i = 0; i < categoriesToBePlacedLast.length; i++) {
        if (a === categoriesToBePlacedLast[i] || b === categoriesToBePlacedLast[i]) {
          return a === categoriesToBePlacedLast[i] ? 1 : -1;
        }
      }

      if (a < b) {
        return -1;
      } else if (a > b) {
        return 1;
      } else {
        return 0;
      }
    }).forEach(categoryName => {
      let parentNode;

      // Don't create `optgroup` node if the items don't belong to any category.
      // These items should be appended directly to the viewSelector node.
      if (categoryName !== NOT_AVAILABLE) {
        parentNode = document.createElement('optgroup');
        parentNode.label = categoryName;

        viewSelector.appendChild(parentNode);
      } else {
        parentNode = viewSelector;
      }

      const items = categorizedItems[categoryName];
      items.forEach(item => {
        const option = document.createElement('option');
        option.value = item.viewPath ? 'extensionViews/' + item.viewPath : 'noConfigIframe.html';
        option.text = item.displayName;
        option.descriptor = item;
        option.selected = item.name === lastSelectedView;
        parentNode.appendChild(option);
      });
    });

    // If Extension Configuration is the selected "group", there's no need to show
    // the second select because there's never more than one view in that group.
    if (groupKey === VIEW_GROUPS.CONFIGURATION) {
      viewSelector.setAttribute('hidden', 'hidden');
    } else {
      viewSelector.removeAttribute('hidden');
    }
  };

  const getSelectedViewGroupValue = () => {
    if (viewGroupSelector.selectedIndex !== -1) {
      return viewGroupSelector.options[viewGroupSelector.selectedIndex].value;
    }
  };

  const getViewURLFromSelector = () => {
    if (viewSelector.selectedIndex !== -1) {
      const option = viewSelector.options[viewSelector.selectedIndex];
      localStorage.setItem('lastSelectedView', option.descriptor.name);
      return option.value;
    }
  };

  let bridge;
  let extensionView;

  const populateInitEditor = (initInfo) => {
    initEditor.setValue(JSON.stringify(initInfo, null, 2));
  };

  const resetGetSettingsEditor = () => {
    getSettingsEditor.setValue('{}');
  };

  const resetValidationOutput = () => {
    validateOutput.innerHTML = '';
  };

  const getDefaultInitInfo = () => {
    const selectedViewDescriptor = getSelectedViewDescriptor();
    const selectedViewGroup = getSelectedViewGroupValue();

    const info = {};

    info.settings = null;

    if (selectedViewGroup !== VIEW_GROUPS.CONFIGURATION) {
      info.extensionSettings = {
        foo: 'bar'
      };
    }

    info.propertySettings = {
      domains: [
        'adobe.com',
        'example.com'
      ],
      linkDelay: 100,
      trackingCookieName: 'sat_track',
      undefinedVarsReturnEmpty: false
    };

    info.tokens = {
      imsAccess: 'X34DF56GHHBBFFGH'
    };

    info.company = {
      orgId: 'ABCDEFGHIJKLMNOPQRSTUVWX@AdobeOrg'
    };

    info.schema = selectedViewDescriptor ? selectedViewDescriptor.schema : null;

    return info;
  };

  const loadSelectedViewIntoIframe = () => {
    if (bridge) {
      bridge.destroy();
    }

    const viewURL = getViewURLFromSelector();

    if (viewURL) {
      const defaultInitInfo = getDefaultInitInfo();
      const cachedInitInfo = getCachedInitInfo();

      let extensionInitOptions;

      if (cachedInitInfo && !deepEqual(cachedInitInfo, defaultInitInfo)) {
        extensionInitOptions = cachedInitInfo;
        resetInitButton.disabled = false;
      } else {
        extensionInitOptions = defaultInitInfo;
        resetInitButton.disabled = true;
      }

      populateInitEditor(extensionInitOptions);
      resetGetSettingsEditor();
      resetValidationOutput();

      bridge = loadIframe({
        url: viewURL,
        container: extensionViewPane,
        extensionInitOptions,
        openCodeEditor,
        openRegexTester,
        openDataElementSelector,
        markAsDirty
      });

      bridge.promise.then(value => extensionView = value).catch(reportIframeCommsError);
    }
  };

  const getSelectedViewDescriptor = () => {
    if (viewSelector.selectedIndex !== -1) {
      return viewSelector.options[viewSelector.selectedIndex].descriptor;
    }
  };

  const reportValidation = () => {
    extensionView
      .validate()
      .then(valid =>  {
        if (valid) {
          const selectedViewDescriptor = getSelectedViewDescriptor();
          if (selectedViewDescriptor && selectedViewDescriptor.schema) {
            return extensionView
              .getSettings()
              .then(settings => {
                const ajv = Ajv();
                ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'));

                const matchesSchema = ajv.validate(selectedViewDescriptor.schema, settings);

                if (matchesSchema) {
                  validateOutput.innerHTML = 'Valid';
                } else {
                  validateOutput.innerHTML =
                    '<span class="error">Settings object does not match schema</span>';
                }
              });
          } else {
            validateOutput.innerHTML = '<span class="error">Schema not defined</span>';
          }
        } else {
          validateOutput.innerHTML = 'Invalid';
        }
      })
      .catch(reportIframeCommsError);
  };

  const reportSettings = () => {
    extensionView
      .getSettings()
      .then(settings => {
        getSettingsEditor.setValue(JSON.stringify(settings, null, 2));
      })
      .catch(reportIframeCommsError);
  };

  const copySettingsToInit = () => {
    // We could just use whatever is in the getSettings output area, but we felt that calling for
    // the settings for the view would be more expected by the user.
    extensionView
      .getSettings()
      .then(settings => {
        let initContent;

        try {
          initContent = JSON.parse(initEditor.getValue());
        } catch (e) {
          alert('Unable to copy settings to init panel. Init panel contents is not valid JSON.');
        }

        initContent.settings = settings;
        populateInitEditor(initContent);
      })
      .catch(reportIframeCommsError);
  };

  const init = () => {
    const initInfo = JSON.parse(initEditor.getValue());
    const defaultInfo = getDefaultInitInfo();

    if (!deepEqual(initInfo,  defaultInfo)) {
      setCachedInitInfo(initInfo);
      resetInitButton.disabled = false;
    }

    extensionView
      .init(initInfo)
      .catch(reportIframeCommsError);
  };

  const resetInit = () => {
    const defaultInfo = getDefaultInitInfo();

    setCachedInitInfo(null);
    populateInitEditor(defaultInfo);
    resetInitButton.disabled = true;

    extensionView
      .init(defaultInfo)
      .catch(reportIframeCommsError);
  };

  const getCachedInitInfo = () => {
    const infoCache = JSON.parse(localStorage.getItem('initInfo') || '{}');
    const viewURL = getViewURLFromSelector();
    return infoCache[viewURL];
  };

  const setCachedInitInfo = (initInfo) => {
    const infoCache = JSON.parse(localStorage.getItem('initInfo') || '{}');
    const viewURL = getViewURLFromSelector();
    infoCache[viewURL] = initInfo;
    localStorage.setItem('initInfo', JSON.stringify(infoCache));
  };

  // Extension configuration is not an array by default because it's only one.
  if (extensionDescriptor.configuration) {
    extensionDescriptor.configuration = [extensionDescriptor.configuration];
  }

  // Populate View Selector.
  if (extensionDescriptor) {
    viewGroupOptionDescriptors.forEach(optionDescriptor => {
      var items = extensionDescriptor[optionDescriptor.value];
      if (items && items.length) {
        var option = document.createElement('option');
        option.value = optionDescriptor.value;
        option.text = optionDescriptor.label;
        option.selected = optionDescriptor.value === lastSelectedViewGroup;
        viewGroupSelector.appendChild(option);
      }
    });
  }

  populateViewSelector();

  viewGroupSelector.addEventListener('change', () => {
    populateViewSelector();
    loadSelectedViewIntoIframe();
  });

  validateButton.addEventListener('click', reportValidation);
  getSettingsButton.addEventListener('click', reportSettings);
  copySettingsToInitButton.addEventListener('click', copySettingsToInit);
  initButton.addEventListener('click', init);
  resetInitButton.addEventListener('click', resetInit);
  viewSelector.addEventListener('change', loadSelectedViewIntoIframe);

  Split(['#extensionViewPane', '#controlPane'], {
    minSize: 0,
    sizes: [
      65, 35
    ]
  });

  loadSelectedViewIntoIframe();

  // There are some timing issues between the CoralUI panelstack and CodeMirror rendering.
  // Without this, sometimes the CodeMirror editors don't render correctly.
  document.querySelector('coral-panelstack').addEventListener('coral-panelstack:change', () => {
    setTimeout(() => {
      initEditor.refresh();
      getSettingsEditor.refresh();
    }, 50);
  });
};

document.addEventListener('DOMContentLoaded', init);
