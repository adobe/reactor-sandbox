'use strict';

var files = require('./constants/files');
var path = require('path');
var getExtensionDescriptor = require('./helpers/getExtensionDescriptor');


var extensionDescriptor = getExtensionDescriptor();
var extensionViewFiles = null;
var outputExtensionViews = null;

module.exports = function(gulp, options) {
  var dependencyTasks = [];
  if (options && options.dependencyTasks) {
    options.dependencyTasks.forEach(function(task) {
      dependencyTasks.push(task);
    });
  }

  if (extensionDescriptor) {
    extensionViewFiles = path.join(path.resolve(extensionDescriptor.viewBasePath), '**/*');
    outputExtensionViews = function() {
      return gulp.src(extensionViewFiles)
        .pipe(gulp.dest(path.join(files.OUTPUT_DIRNAME, 'extensionViews')));
    };
  }

  gulp.task('sandbox:outputExtensionViews', dependencyTasks, function() {
    if (outputExtensionViews) {
      return outputExtensionViews();
    }
  });

  gulp.task('sandbox:watchOutputExtensionViews', dependencyTasks, function() {
    if (outputExtensionViews) {
      gulp.watch(extensionViewFiles, function() {
        console.log('Extension view change detected. Republished.');
        outputExtensionViews();
      });
    }
  });
};
