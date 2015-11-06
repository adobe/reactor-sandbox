'use strict';

(function() {
  var VIEW_GROUPS = {
    'extensionConfiguration': 'Extension Configuration',
    'eventDelegates': 'Event Delegates',
    'conditionDelegates': 'Condition Delegates',
    'actionDelegates': 'Action Delegates',
    'dataElementDelegates': 'Data Element Delegates'
  };

  document.addEventListener('DOMContentLoaded', function() {
    var viewSelector = document.getElementById('extensionViewSelector');
    var viewIframe = document.getElementById('extensionViewIframe');
    var validateButton = document.getElementById('validateButton');
    var validateOutput = document.getElementById('validateOutput');
    var getConfigField = document.getElementById('getConfigField');
    var getConfigButton = document.getElementById('getConfigButton');
    var setConfigField = document.getElementById('setConfigField');
    var setConfigButton = document.getElementById('setConfigButton');

    // Populate View Selector.
    if (extensionDescriptor) {
      Object.keys(VIEW_GROUPS).forEach(function(groupKey) {
        var items = extensionDescriptor[groupKey];
        if (items && items.length) {
          var optgroup = document.createElement('optgroup');
          optgroup.label = VIEW_GROUPS[groupKey];

          items.forEach(function (item) {
            var option = document.createElement('option');
            option.value = item.viewPath;
            option.text = item.displayName;
            option.descriptor = item;

            optgroup.appendChild(option);
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

      extensionBridge.validate(viewIframe, schema, function(valid) {
        validateOutput.innerHTML = valid ? 'Valid' : 'Invalid';
      });
    });

    getConfigButton.addEventListener('click', function() {
      extensionBridge.getConfig(viewIframe, function(config) {
        getConfigField.value = JSON.stringify(config);
      });
    });

    setConfigButton.addEventListener('click', function() {
      extensionBridge.setConfig(viewIframe, JSON.parse(setConfigField.value));
    });
  });
})();
