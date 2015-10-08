'use strict';

var path = require('path');
var constants = require('./constants');

module.exports = function(gulp) {
  gulp.task('watch', ['copyTemplates'], function() {
    gulp.watch(
      path.join(constants.TEMPLATES_DIRNAME, constants.CONTAINER_TEMPLATE_FILENAME),
      ['buildContainer']
    );

    gulp.watch(
      path.join(constants.TEMPLATES_DIRNAME, constants.HTML_TEMPLATE_FILENAME),
      ['copyHTMLToOutput']
    );
  });
};
