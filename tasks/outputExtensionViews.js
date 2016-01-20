'use strict';

var files = require('./constants/files');
var path = require('path');
var extensionDescriptor = require('./helpers/extensionDescriptor');

module.exports = function(gulp, options) {
  var dependencyTasks = [];
  options.dependencyTasks.forEach(function(task) {   dependencyTasks.push(task); });


  gulp.task('sandbox:outputExtensionViews', dependencyTasks, function() {
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
