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
  var getConfigField = document.getElementById('getConfigField');
  var getConfigButton = document.getElementById('getConfigButton');
  var setConfigField = document.getElementById('setConfigField');
  var setConfigButton = document.getElementById('setConfigButton');
  var viewIframeContainer = document.getElementById('iframeContainer');
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

  var extensionBridgeIFrame;
  var loadSelectedViewIntoIframe = function() {
    viewIframeContainer.classList.add(LOADING_CLASS_NAME);

    if (extensionBridgeIFrame) {
      extensionBridgeIFrame.destroy();
    }

    var viewIframe = document.createElement('iframe');
    viewIframe.dataset.frameboyant = true;
    viewIframe.onload = function() {
      extensionBridgeIFrame = extensionBridge(viewIframe);
      extensionBridgeIFrame.openCodeEditor = openCodeEditor;
      extensionBridgeIFrame.openRegexTester = openRegexTester;
      extensionBridgeIFrame.openDataElementSelector = openDataElementSelector;
      extensionBridgeIFrame.initialRenderCompleteCallback = function() {
        viewIframeContainer.classList.remove(LOADING_CLASS_NAME);
      };
      initView();
    };

    if (viewSelector.selectedIndex !== -1) {
      var viewPath = viewSelector.options[viewSelector.selectedIndex].value;
      viewIframe.src = 'extensionViews/' + viewPath;
      localStorage.setItem('lastSelectedView', viewPath);
    }

    viewIframeContainer.appendChild(viewIframe);
  };

  var initView = function() {
    if (viewSelector.selectedIndex !== -1) {
      selectedViewDescriptor = viewSelector.options[viewSelector.selectedIndex].descriptor;
    }

    extensionBridgeIFrame.init({
      config: setConfigField.value.length ? JSON.parse(setConfigField.value) : null,
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

  validateButton.addEventListener('click', function() {
    extensionBridgeIFrame.validate(function(valid) {
      if (valid) {
        if (selectedViewDescriptor && selectedViewDescriptor.schema) {
          extensionBridgeIFrame.getConfig(function(config) {
            var ajv = Ajv();
            var matchesSchema = ajv.validate(selectedViewDescriptor.schema, config);

            if (matchesSchema) {
              validateOutput.innerHTML = 'Valid';
            } else {
              validateOutput.innerHTML =
                '<span class="error">Config does not match schema</span>';
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

  getConfigButton.addEventListener('click', function() {
    extensionBridgeIFrame.getConfig(function(config) {
      getConfigField.value = JSON.stringify(config);
    });
  });

  setConfigButton.addEventListener('click', initView);
});
