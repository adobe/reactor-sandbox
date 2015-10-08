'use strict';

var webserver = require('gulp-webserver');
var constants = require('./constants');

module.exports = function(gulp) {
  gulp.task('serve', ['copyHTMLToOutput', 'buildContainer', 'buildEngine'], function() {
    return gulp.src(constants.OUTPUT_DIRNAME)
      .pipe(webserver({
        port: 7000,
        livereload: true,
        open: true
      }));
  });
};
