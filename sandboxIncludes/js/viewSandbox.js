'use strict';

(function() {
  var VIEW_GROUPS = {
    'events': 'Events',
    'conditions': 'Conditions',
    'actions': 'Actions',
    'dataElements': 'Data Elements'
  };

  document.addEventListener('DOMContentLoaded', function() {
    var viewSelector = document.getElementById('extensionViewSelector');
    var validateButton = document.getElementById('validateButton');
    var validateOutput = document.getElementById('validateOutput');
    var getConfigField = document.getElementById('getConfigField');
    var getConfigButton = document.getElementById('getConfigButton');
    var setConfigField = document.getElementById('setConfigField');
    var setConfigButton = document.getElementById('setConfigButton');

    var viewIframe = document.getElementById('extensionViewIframe');
    var windGogglesIframe = require('turbine-windgoggles')(viewIframe);

    // Populate View Selector.
    if (extensionDescriptor) {
      var addOption = function(parent, viewPath, displayName, descriptor) {
        var option = document.createElement('option');
        option.value = viewPath;
        option.text = displayName;
        option.descriptor = descriptor;
        parent.appendChild(option);
      };

      if (extensionDescriptor.viewPath) {
        addOption(
          viewSelector,
          extensionDescriptor.viewPath,
          'Extension Configuration',
          extensionDescriptor);
      }

      Object.keys(VIEW_GROUPS).forEach(function(groupKey) {
        var items = extensionDescriptor[groupKey];
        if (items && items.length) {
          var optgroup = document.createElement('optgroup');
          optgroup.label = VIEW_GROUPS[groupKey];

          items.forEach(function(item) {
            addOption(optgroup, item.viewPath, item.displayName, item);
          });

          viewSelector.appendChild(optgroup);
        }
      });
    }

    var loadSelectedViewIntoIframe = function() {
      if (viewSelector.selectedIndex !== -1) {
        var viewPath = viewSelector.options[viewSelector.selectedIndex].value;
        viewIframe.src = 'extensionViews/' + viewPath;
      }
    };

    loadSelectedViewIntoIframe();
    viewSelector.addEventListener('change', loadSelectedViewIntoIframe);

    validateButton.addEventListener('click', function() {
      var schema = null;
      if (viewSelector.selectedIndex !== -1) {
        var descriptor = viewSelector.options[viewSelector.selectedIndex].descriptor;
        if (descriptor) {
          schema = descriptor.schema;
        }
      }

      windGogglesIframe.validate(schema, function(valid) {
        validateOutput.innerHTML = valid ? 'Valid' : 'Invalid';
      });
    });

    getConfigButton.addEventListener('click', function() {
      windGogglesIframe.getConfig(function(config) {
        getConfigField.value = JSON.stringify(config);
      });
    });

    setConfigButton.addEventListener('click', function() {
      windGogglesIframe.setConfig(JSON.parse(setConfigField.value));
    });
  });
})();
