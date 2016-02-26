'use strict';

var path = require('path');
var files = require('./constants/files');

module.exports = function(gulp) {
  var turbine = require(path.join(path.dirname(require.resolve('@reactor/turbine')), 'index.js'));

  gulp.task('sandbox:buildEngine', turbine.createBuildTask({
    // Although the sandbox is for manual testing, ENV_TEST should only be used for running
    // automated tests.
    ENV_TEST: false
  }));

  gulp.task('sandbox:outputEngine', ['sandbox:buildEngine'], function() {
    return gulp
      .src(path.join(path.dirname(require.resolve('@reactor/turbine')), 'dist', 'engine.js'))
      .pipe(gulp.dest(path.join(files.OUTPUT_DIRNAME, files.OUTPUT_INCLUDES_DIRNAME, 'js')));
  });
};
