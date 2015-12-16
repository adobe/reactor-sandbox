'use strict';

(function() {
  var VIEW_GROUPS = {
    'configuration': 'Extension Configuration',
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
    var viewIframeContainer = document.getElementById('iframeContainer');
    var lastSelectedView = localStorage.getItem('lastSelectedView');

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
            opts.parent.appendChild(optgroup);
          });

          viewSelector.appendChild(optgroup);
        }
      });
    }

    var windGogglesIframe;
    var loadSelectedViewIntoIframe = function() {
      if (windGogglesIframe) {
        windGogglesIframe.destroy();
      }

      var viewIframe = document.createElement('iframe');
      viewIframe.dataset.frameboyant = true;
      viewIframe.onload = function() {
        windGogglesIframe = require('turbine-windgoggles')(viewIframe);
      };

      if (viewSelector.selectedIndex !== -1) {
        var viewPath = viewSelector.options[viewSelector.selectedIndex].value;
        viewIframe.src = 'extensionViews/' + viewPath;
        localStorage.setItem('lastSelectedView', viewPath);
      }

      viewIframeContainer.appendChild(viewIframe);
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
