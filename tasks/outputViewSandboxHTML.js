'use strict';

var path = require('path');
var files = require('./constants/files');
var replace = require('gulp-replace');
var extensionDescriptor = require('./helpers/extensionDescriptor');

var VIEW_GROUPS = {
  'extensionConfiguration': 'Extension Configuration',
  'eventDelegates': 'Event Delegates',
  'conditionDelegates': 'Condition Delegates',
  'actionDelegates': 'Action Delegates',
  'dataElementDelegates': 'Data Element Delegates'
};

module.exports = function(gulp) {
  var getViewOptionHTML = function() {
    var options = '';

    if (extensionDescriptor) {
      Object.keys(VIEW_GROUPS).forEach(function(groupKey) {
        var items = extensionDescriptor[groupKey];
        if (items && items.length) {
          options += '<optgroup label="' + VIEW_GROUPS[groupKey] + '">';

          items.forEach(function(item) {
            options += '<option value="' + item.viewPath + '">' + item.displayName + '</option>';
          });

          options += '</optgroup>';
        }
      });
    }

    return options;
  };

  gulp.task(
    'sandbox:outputViewSandboxHTML',
    ['sandbox:initTemplates'],
    function() {
      return gulp
        .src(path.join(files.TEMPLATES_DIRNAME, files.VIEW_SANDBOX_TEMPLATE_FILENAME))
        .pipe(replace('<!-- view options -->', getViewOptionHTML()))
        .pipe(gulp.dest(files.OUTPUT_DIRNAME));
    }
  );
};
