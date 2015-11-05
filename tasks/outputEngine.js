'use strict';

var path = require('path');
var files = require('./constants/files');
var packageDescriptor = require('./helpers/packageDescriptor');

module.exports = function(gulp) {
  gulp.task('sandbox:outputEngine', ['turbine:build'], function() {
    // Copy the built engine from turbine. Take into consideration that this task may be running
    // from within turbine itself.
    var turbinePath;

    if (packageDescriptor.name === 'turbine') {
      turbinePath = process.cwd();
    } else {
      turbinePath = path.dirname(require.resolve('turbine'));
    }

    return gulp
      .src(path.join(turbinePath, 'dist', 'engine.js'))
      .pipe(gulp.dest(path.join(files.OUTPUT_DIRNAME, files.OUTPUT_INCLUDES_DIRNAME, 'js')));
  });
};
