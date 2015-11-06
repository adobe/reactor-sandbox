'use strict';

var webserver = require('gulp-webserver');
var files = require('./constants/files');
var path = require('path');

module.exports = function(gulp) {
  gulp.task('sandbox:serve',
    ['sandbox:outputSandboxHTMLs', 'sandbox:outputContainer', 'sandbox:outputEngine'],
    function() {
      return gulp.src(path.resolve(files.OUTPUT_DIRNAME))
        .pipe(webserver({
          host: '0.0.0.0',
          https: true,
          port: 7000,
          livereload: true,
          open: files.LIB_SANDBOX_TEMPLATE_FILENAME
        }));
    });
};
