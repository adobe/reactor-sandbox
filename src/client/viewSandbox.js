'use strict';

import Promise from 'native-promise-only-ponyfill';
import { loadIframe, setPromise, setDebug } from '@reactor/extension-support-bridge';
import Ajv from 'ajv';

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

const getRandomValue = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

const clearSelectOptions = comboBox => comboBox.innerHTML = '';

const openCodeEditor = code =>
  Promise.resolve('Edited Code ' + Math.round(Math.random() * 10000));

const openRegexTester = regex =>
  Promise.resolve('Edited Regex ' + Math.round(Math.random() * 10000));

const openDataElementSelector = () =>
  Promise.resolve('dataElement' + Math.round(Math.random() * 10000));

const openCssSelector = () => {
  const tags = ['a', 'abbr', 'address', 'area', 'article', 'aside', 'audio', 'b', 'base', 'bdi',
    'bdo', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'cite', 'code', 'col',
    'colgroup', 'data', 'datalist', 'dd', 'del', 'details', 'dfn', 'dialog', 'div', 'dl', 'dt',
    'em', 'embed', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4',
    'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html', 'i', 'iframe', 'img', 'input', 'ins',
    'kbd', 'keygen', 'label', 'legend', 'li', 'link', 'main', 'map', 'mark', 'menu', 'menuitem',
    'meta', 'meter', 'nav', 'noscript', 'object', 'ol', 'optgroup', 'option', 'output', 'p',
    'param', 'pre', 'progress', 'q', 'rb', 'rp', 'rt', 'rtc', 'ruby', 's', 'samp', 'script',
    'section', 'select', 'small', 'source', 'span', 'strong', 'style', 'sub', 'summary', 'sup',
    'table', 'tbody', 'td', 'template', 'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr',
    'track', 'u', 'ul', 'var', 'video', 'wbr'];

  const selector = [' ', ', ', ' > ', ' + ', ' ~ '];
  const result = [];

  for (let i = 0, l = getRandomValue(1, 5); i < l; i++) {
    result.push(tags[getRandomValue(0, tags.length - 1)]);
    result.push(selector[getRandomValue(0, selector.length - 1)]);
  }

  result.pop();

  return Promise.resolve(result.join(''));
};

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

const editModeEntered = () => document.body.classList.add('editMode');
const editModeExited = () => document.body.classList.remove('editMode');

const init = () => {
  const viewGroupSelector = document.getElementById('viewGroupSelector');
  const viewSelector = document.getElementById('extensionViewSelector');
  const validateButton = document.getElementById('validateButton');
  const validateOutput = document.getElementById('validateOutput');
  const initEditor =
    CodeMirror(document.getElementById('initEditorContainer'), codeMirrorConfig);
  const initButton = document.getElementById('initButton');
  const getSettingsEditor =
    CodeMirror(document.getElementById('getSettingsEditorContainer'), codeMirrorConfig);
  const getSettingsButton = document.getElementById('getSettingsButton');
  const extensionViewContainer = document.getElementById('extensionViewContainer');

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
        option.value = item.viewPath;
        option.text = item.displayName;
        option.descriptor = item;
        option.selected = item.viewPath === lastSelectedView;
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

  const getViewURLFromSelector = () => {
    if (viewSelector.selectedIndex !== -1) {
      const viewPath = viewSelector.options[viewSelector.selectedIndex].value;
      localStorage.setItem('lastSelectedView', viewPath);
      return 'extensionViews/' + viewPath;
    }
  };

  let extensionView;

  const loadSelectedViewIntoIframe = () => {
    if (extensionView) {
      extensionView.destroy();
    }

    const viewURL = getViewURLFromSelector();

    if (viewURL) {
      const selectedViewDescriptor = getSelectedViewDescriptor();

      const extensionInitOptions = {
        settings: null,
        extensionConfiguration: {
          foo: 'bar'
        },
        propertySettings: {
          domains: [
            'adobe.com',
            'example.com'
          ],
          linkDelay: 100,
          euCookieName: 'sat_track',
          undefinedVarsReturnEmpty: false
        },
        tokens: {
          imsAccess: 'X34DF56GHHBBFFGH'
        },
        company: {
          orgId: 'ABCDEFGHIJKLMNOPQRSTUVWX@AdobeOrg'
        },
        schema: selectedViewDescriptor ? selectedViewDescriptor.schema : null
      };

      initEditor.setValue(JSON.stringify(extensionInitOptions, null, 2));

      loadIframe({
        url: viewURL,
        container: extensionViewContainer,
        extensionInitOptions,
        openCodeEditor,
        openRegexTester,
        openDataElementSelector,
        openCssSelector,
        editModeEntered,
        editModeExited
      }).then(value => extensionView = value);
    }
  };

  const getSelectedViewDescriptor = () => {
    if (viewSelector.selectedIndex !== -1) {
      return viewSelector.options[viewSelector.selectedIndex].descriptor;
    }
  };

  const reportValidation = () => {
    extensionView.validate().then(valid =>  {
      if (valid) {
        const selectedViewDescriptor = getSelectedViewDescriptor();
        if (selectedViewDescriptor && selectedViewDescriptor.schema) {
          extensionView.getSettings().then(settings => {
            const ajv = Ajv();
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
    });
  };

  const reportSettings = () => {
    extensionView.getSettings().then(settings => {
      getSettingsEditor.setValue(JSON.stringify(settings, null, 2));
    });
  };

  const init = () => {
    extensionView.init(JSON.parse(initEditor.getValue()));
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
  initButton.addEventListener('click', init);
  viewSelector.addEventListener('change', loadSelectedViewIntoIframe);

  loadSelectedViewIntoIframe();
};

document.addEventListener('DOMContentLoaded', init);
