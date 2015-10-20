'use strict';

var fs = require('fs');
var path = require('path');
var files = require('./constants/files');
var glob = require('glob');

module.exports = function(gulp) {
  gulp.task('sandbox:initTemplates', function() {
    // Only copy these files into the project's templates directory if they don't already exist
    // there. This allows the engineer to make edits to index.html and container.txt for testing
    // purposes.
    var templatePaths = glob.sync(path.resolve(__dirname, '..', files.TEMPLATES_DIRNAME, '*'));

    templatePaths = templatePaths
      .filter(function(templatePath) {
        // Determine if a template of the same name is in the extension project. If so,
        // we don't want to overwrite it so we filter out this template.
        try {
          fs.lstatSync(path.resolve(files.TEMPLATES_DIRNAME, path.basename(templatePath)));
          return false;
        } catch (e) {
          return true;
        }
      });


    if (templatePaths.length) {
      return gulp
        .src(templatePaths)
        .pipe(gulp.dest(path.resolve(files.TEMPLATES_DIRNAME)));
    }
  });
};
