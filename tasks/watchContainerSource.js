'use strict';

var path = require('path');
var files = require('./constants/files');

module.exports = function(gulp) {
  gulp.task('sandbox:watchContainerSource', ['sandbox:initTemplates'], function() {
    gulp.watch(
      [
        path.join(files.TEMPLATES_DIRNAME, files.CONTAINER_TEMPLATE_FILENAME),
        path.join(files.SRC_DIRNAME, files.SRC_FILENAMES)
      ],
      ['sandbox:outputContainer']
    );
  });
};
