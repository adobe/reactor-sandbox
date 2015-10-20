'use strict';

var path = require('path');
var files = require('./constants/files');
var packageDescriptor = require('./helpers/packageDescriptor');

module.exports = function(gulp) {
  gulp.task('sandbox:outputEngine', ['turbine:build'], function() {
    // Copy the built engine from turbine. Unless, of course, we're running this builder
    // from within turbine in which case it will already exist where we want it.
    var turbinePath = packageDescriptor.name === 'turbine' ? process.cwd() :
      path.resolve(__dirname, '../node_modules/turbine');
    return gulp
      .src(path.join(turbinePath, 'dist', 'engine.js'))
      .pipe(gulp.dest(path.join(files.OUTPUT_DIRNAME, files.OUTPUT_INCLUDES_DIRNAME)));
  });
};
