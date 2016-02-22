'use strict';

var extensionBridge = require('@reactor/extension-bridge');
var Ajv = require('ajv');

var VIEW_GROUPS = {
  'configuration': 'Extension Configuration',
  'events': 'Events',
  'conditions': 'Conditions',
  'actions': 'Actions',
  'dataElements': 'Data Elements'
};

var LOADING_CLASS_NAME = 'loading';

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
  var viewSelector = document.getElementById('extensionViewSelector');
  var validateButton = document.getElementById('validateButton');
  var validateOutput = document.getElementById('validateOutput');
  var getSettingsField = document.getElementById('getSettingsField');
  var getSettingsButton = document.getElementById('getSettingsButton');
  var initField = document.getElementById('initField');
  var initButton = document.getElementById('initButton');
  var viewIframeContainer = document.getElementById('iframeContainer');
  var openNewTabButton = document.getElementById('newTabButton');

  var lastSelectedView = localStorage.getItem('lastSelectedView');
  var selectedViewDescriptor;

  // Populate View Selector.
  if (extensionDescriptor) {
    Object.keys(VIEW_GROUPS).forEach(function(groupKey) {
      var items = extensionDescriptor[groupKey];
      if (items && items.length) {
        var optgroup = document.createElement('optgroup');
        optgroup.label = VIEW_GROUPS[groupKey];

        items.forEach(function(item) {
          var option = document.createElement('option');
          option.value = item.viewPath;
          option.text = item.displayName;
          option.descriptor = item;
          option.selected = item.viewPath === lastSelectedView;
          optgroup.appendChild(option);
        });

        viewSelector.appendChild(optgroup);
      }
    });
  }

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
    viewIframe.dataset.frameboyant = true;
    viewIframe.onload = function() {
      iframeExtensionBridge = extensionBridge(viewIframe);
      iframeExtensionBridge.openCodeEditor = openCodeEditor;
      iframeExtensionBridge.openRegexTester = openRegexTester;
      iframeExtensionBridge.openDataElementSelector = openDataElementSelector;
      iframeExtensionBridge.initialRenderComplete.then(function() {
        viewIframeContainer.classList.remove(LOADING_CLASS_NAME);
      });
      initView();
    };

    var viewURL = getViewURLFromSelector();
    if (viewURL) {
      viewIframe.src = viewURL;
    }

    viewIframeContainer.appendChild(viewIframe);
  };

  var initView = function() {
    if (viewSelector.selectedIndex !== -1) {
      selectedViewDescriptor = viewSelector.options[viewSelector.selectedIndex].descriptor;
    }

    iframeExtensionBridge.init({
      settings: initField.value.length ? JSON.parse(initField.value) : null,
      schema: selectedViewDescriptor ? selectedViewDescriptor.schema : null,
      propertyConfig: {
        domainList: [
          'adobe.com',
          'example.com'
        ]
      }
    });
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
      getSettingsField.value = JSON.stringify(settings);
    });
  });

  initButton.addEventListener('click', initView);
});
