'use strict';

var extensionBridge = require('@reactor/extension-support-bridge');
var Ajv = require('ajv');

var VIEW_GROUPS = {
  'configuration': 'Extension Configuration',
  'events': 'Events',
  'conditions': 'Conditions',
  'actions': 'Actions',
  'dataElements': 'Data Elements'
};

var NOT_AVAILABLE = '--N/A--';
var OTHER = 'Other';

var LOADING_CLASS_NAME = 'loading';

var codeMirrorConfig = {
  lineNumbers: true,
  mode: 'application/json',
  gutters: ['CodeMirror-lint-markers'],
  lint: true,
  value: '{}',
  extraKeys: {
    'Tab': function(cm) {
      cm.replaceSelection('  ' , 'end');
    }
  }
};

var clearSelectOptions = function(comboBox) {
  comboBox.innerHTML = '';
};

var openCodeEditor = function(code, callback) {
  callback('Edited Code ' + Math.round(Math.random() * 10000));
};

var openRegexTester = function(regex, callback) {
  callback('Edited Regex ' + Math.round(Math.random() * 10000));
};

var openDataElementSelector = function(callback) {
  callback('dataElement' + Math.round(Math.random() * 10000));
};

document.addEventListener('DOMContentLoaded', function() {


  var viewGroupSelector = document.getElementById('viewGroupSelector');
  var viewSelector = document.getElementById('extensionViewSelector');
  var validateButton = document.getElementById('validateButton');
  var validateOutput = document.getElementById('validateOutput');
  var initEditor =
    CodeMirror(document.getElementById('initEditorContainer'), codeMirrorConfig);
  var initButton = document.getElementById('initButton');
  var getSettingsEditor =
    CodeMirror(document.getElementById('getSettingsEditorContainer'), codeMirrorConfig);
  var getSettingsButton = document.getElementById('getSettingsButton');
  var viewIframeContainer = document.getElementById('iframeContainer');
  var openNewTabButton = document.getElementById('newTabButton');

  var lastSelectedView = localStorage.getItem('lastSelectedView');
  var lastSelectedViewGroup = localStorage.getItem('lastSelectedViewGroup');

  // Extension configuration is not an array by default because it's only one.
  if (extensionDescriptor.configuration) {
    extensionDescriptor.configuration.displayName = extensionDescriptor.displayName;
    extensionDescriptor.configuration = [extensionDescriptor.configuration];
  }

  // Populate View Selector.
  if (extensionDescriptor) {
    Object.keys(VIEW_GROUPS).forEach(function(groupKey) {
      var items = extensionDescriptor[groupKey];
      if (items && items.length) {
        var option = document.createElement('option');
        option.value = groupKey;
        option.text = VIEW_GROUPS[groupKey];
        option.selected = groupKey === lastSelectedViewGroup;
        viewGroupSelector.appendChild(option);
      }
    });
  }

  var getCategorizedItems = function(items) {
    var groupedItems = {};

    items.forEach(function(item) {
      var categoryName = item.categoryName || NOT_AVAILABLE;
      if (!groupedItems[categoryName]) {
        groupedItems[categoryName] = [];
      }
      groupedItems[categoryName].push(item);
    });

    Object.keys(groupedItems).forEach(function(categoryName) {
      groupedItems[categoryName].sort(function(a, b) {
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

  var populateViewSelector = function() {
    clearSelectOptions(viewSelector);
    var groupKey = viewGroupSelector.value;
    localStorage.setItem('lastSelectedViewGroup', groupKey);

    var categorizedItems = getCategorizedItems(extensionDescriptor[groupKey]);
    Object.keys(categorizedItems).sort(function(a, b) {
      var categoriesToBePlacedLast = [NOT_AVAILABLE, OTHER];

      for (var i = 0; i < categoriesToBePlacedLast.length; i++) {
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
    }).forEach(function(categoryName) {
      var parentNode;

      // Don't create `optgroup` node if the items don't belong to any category.
      // These items should be appended directly to the viewSelector node.
      if (categoryName !== NOT_AVAILABLE) {
        parentNode = document.createElement('optgroup');
        parentNode.label = categoryName;

        viewSelector.appendChild(parentNode);
      } else {
        parentNode = viewSelector;
      }

      var items = categorizedItems[categoryName];
      items.forEach(function(item) {
        var option = document.createElement('option');
        option.value = item.viewPath;
        option.text = item.displayName;
        option.descriptor = item;
        option.selected = item.viewPath === lastSelectedView;
        parentNode.appendChild(option);
      });
    });
  };

  populateViewSelector();
  viewGroupSelector.addEventListener('change', function() {
    populateViewSelector();
    loadSelectedViewIntoIframe();
  });

  var getViewURLFromSelector = function() {
    if (viewSelector.selectedIndex !== -1) {
      var viewPath = viewSelector.options[viewSelector.selectedIndex].value;
      localStorage.setItem('lastSelectedView', viewPath);
      return 'extensionViews/' + viewPath;
    }
  };

  var iframeExtensionBridge;
  var loadSelectedViewIntoIframe = function() {
    viewIframeContainer.classList.add(LOADING_CLASS_NAME);

    if (iframeExtensionBridge) {
      iframeExtensionBridge.destroy();
    }

    var viewIframe = document.createElement('iframe');
    viewIframe.onload = function() {
      iframeExtensionBridge = extensionBridge(viewIframe, {
        openCodeEditor: openCodeEditor,
        openRegexTester: openRegexTester,
        openDataElementSelector: openDataElementSelector,
        onInitialRenderComplete: function() {
          viewIframeContainer.classList.remove(LOADING_CLASS_NAME);
        }
      });

      var selectedViewDescriptor = getSelectedViewDescriptor();

      var initOptions = {
        settings: null,
        extensionConfigurations: [
          {
            id: 'EC123',
            name: 'Example Extension Configuration',
            enabled: true,
            settings: {
              foo: 'bar'
            }
          }
        ],
        propertySettings: {
          domainList: [
            'adobe.com',
            'example.com'
          ]
        },
        schema: selectedViewDescriptor ? selectedViewDescriptor.schema : null
      };

      initEditor.setValue(JSON.stringify(initOptions, null, 2));
      iframeExtensionBridge.init(initOptions);

      // LiveReload will reload the iframe content whenever we change the source of the views.
      viewIframe.contentWindow.onbeforeunload = function() {
        viewIframe.onload = null;
        loadSelectedViewIntoIframe();
      };
    };

    var viewURL = getViewURLFromSelector();
    if (viewURL) {
      viewIframe.src = viewURL;
    }

    viewIframeContainer.appendChild(viewIframe);
  };

  var getSelectedViewDescriptor = function() {
    if (viewSelector.selectedIndex !== -1) {
      return viewSelector.options[viewSelector.selectedIndex].descriptor;
    }
  };

  loadSelectedViewIntoIframe();
  viewSelector.addEventListener('change', loadSelectedViewIntoIframe);

  var openViewInNewTab = function() {
    var viewURL = getViewURLFromSelector();

    if (viewURL) {
      window.open(viewURL);
    }
  };
  openNewTabButton.addEventListener('click', openViewInNewTab);

  validateButton.addEventListener('click', function() {
    iframeExtensionBridge.validate(function(valid) {
      if (valid) {
        var selectedViewDescriptor = getSelectedViewDescriptor();
        if (selectedViewDescriptor && selectedViewDescriptor.schema) {
          iframeExtensionBridge.getSettings(function(settings) {
            var ajv = Ajv();
            var matchesSchema = ajv.validate(selectedViewDescriptor.schema, settings);

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
  });

  getSettingsButton.addEventListener('click', function() {
    iframeExtensionBridge.getSettings(function(settings) {
      getSettingsEditor.setValue(JSON.stringify(settings, null, 2));
    });
  });

  initButton.addEventListener('click', function() {
    iframeExtensionBridge.init(JSON.parse(initEditor.getValue()));
  });
});
