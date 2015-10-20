'use strict';

(function() {
  document.addEventListener('DOMContentLoaded', function() {
    var viewSelector = document.getElementById('extensionViewSelector');
    var viewIframe = document.getElementById('extensionViewIframe');

    var loadSelectedViewIntoIframe = function() {
      if (viewSelector.selectedIndex !== -1) {
        var viewPath = viewSelector.options[viewSelector.selectedIndex].value;
        viewIframe.src = 'extensionViews/' + viewPath;
      }
    };

    loadSelectedViewIntoIframe();
    viewSelector.addEventListener('change', loadSelectedViewIntoIframe);
  });
})();
