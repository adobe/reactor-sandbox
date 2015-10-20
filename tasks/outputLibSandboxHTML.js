'use strict';

var path = require('path');
var files = require('./constants/files');

module.exports = function(gulp) {
  gulp.task('sandbox:outputLibSandboxHTML', ['sandbox:initTemplates'], function() {
    return gulp
      .src(path.join(files.TEMPLATES_DIRNAME, files.LIB_SANDBOX_TEMPLATE_FILENAME))
      .pipe(gulp.dest(files.OUTPUT_DIRNAME));
  });
};
