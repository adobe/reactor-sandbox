'use strict';

var fs = require('fs');
var path = require('path');
var constants = require('./constants');

module.exports = function(gulp) {
  gulp.task('copyTemplates', function() {
    var templatesToCopy = [];

    // Only copy these files into the project's templates directory if they don't already exist
    // there. This allows the engineer to make edits to index.html and container.txt for testing
    // purposes.

    try {
      fs.lstatSync(path.join(constants.TEMPLATES_DIRNAME, constants.HTML_TEMPLATE_FILENAME));
    } catch (e) {
      templatesToCopy.push(
        path.join(__dirname, constants.TEMPLATES_DIRNAME, constants.HTML_TEMPLATE_FILENAME));
    }

    try {
      fs.lstatSync(path.join(constants.TEMPLATES_DIRNAME, constants.CONTAINER_TEMPLATE_FILENAME));
    } catch (e) {
      templatesToCopy.push(
        path.join(__dirname, constants.TEMPLATES_DIRNAME, constants.CONTAINER_TEMPLATE_FILENAME));
    }

    if (templatesToCopy.length) {
      return gulp
        .src(templatesToCopy)
        .pipe(gulp.dest(constants.TEMPLATES_DIRNAME));
    }
  });
}
