'use strict';

var fs = require('fs');
var path = require('path');
var constants = require('./constants');

var TEMPLATE_FILENAMES = [
  constants.HTML_TEMPLATE_FILENAME,
  constants.CONTAINER_TEMPLATE_FILENAME
];

module.exports = function(gulp) {
  gulp.task('copyTemplates', function() {
    // Only copy these files into the project's templates directory if they don't already exist
    // there. This allows the engineer to make edits to index.html and container.txt for testing
    // purposes.
    var templateFilenamesToCopy = TEMPLATE_FILENAMES.filter(function(templateFilename) {
      try {
        fs.lstatSync(path.join(constants.TEMPLATES_DIRNAME, templateFilename));
        return false;
      } catch (e) {
        return true;
      }
    }).map(function(templateFilename) {
      return path.resolve(__dirname, '..', constants.TEMPLATES_DIRNAME, templateFilename);
    });

    if (templateFilenamesToCopy.length) {
      return gulp
        .src(templateFilenamesToCopy)
        .pipe(gulp.dest(path.join(process.cwd(), constants.TEMPLATES_DIRNAME)));
    }
  });
};
