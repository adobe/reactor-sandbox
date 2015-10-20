'use strict';

var files = require('./constants/files');
var path = require('path');
var extensionDescriptor = require('./helpers/extensionDescriptor');

module.exports = function(gulp, options) {
  var dependencyTasks = [];

  if (options.buildViewTask) {
    dependencyTasks.push(options.buildViewTask);
  }

  gulp.task('sandbox:outputExtensionViews', dependencyTasks, function() {
    if (extensionDescriptor) {
      var extensionViewFiles = path.join(path.resolve(extensionDescriptor.viewBasePath), '**/*');
      gulp.src(extensionViewFiles)
        .pipe(gulp.dest(path.join(files.OUTPUT_DIRNAME, 'extensionViews')));
    }
  });
};
