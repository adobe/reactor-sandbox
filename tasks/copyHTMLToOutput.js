'use strict';

var path = require('path');
var constants = require('./constants');

module.exports = function(gulp) {
  gulp.task('copyHTMLToOutput', ['copyTemplates'], function() {
    return gulp
      .src(path.join(constants.TEMPLATES_DIRNAME, constants.HTML_TEMPLATE_FILENAME))
      .pipe(gulp.dest(constants.OUTPUT_DIRNAME));
  });
}
