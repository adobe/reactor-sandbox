'use strict';

var files = require('./constants/files');
var path = require('path');
var getExtensionDescriptor = require('./helpers/getExtensionDescriptor');

module.exports = function(gulp, options) {
  var dependencyTasks = [];
  if (options && options.dependencyTasks) {
    options.dependencyTasks.forEach(function(task) {
      dependencyTasks.push(task);
    });
  }

  gulp.task('sandbox:outputExtensionViews', dependencyTasks, function() {
    var extensionDescriptor = getExtensionDescriptor();
    if (extensionDescriptor) {
      var extensionViewFiles = path.join(path.resolve(extensionDescriptor.viewBasePath), '**/*');
      var outputExtensionViews = function() {
        return gulp.src(extensionViewFiles)
          .pipe(gulp.dest(path.join(files.OUTPUT_DIRNAME, 'extensionViews')));
      };

      gulp.watch(extensionViewFiles, function() {
        console.log('Extension view change detected. Republished.');
        outputExtensionViews();
      });

      return outputExtensionViews();
    }
  });
};
