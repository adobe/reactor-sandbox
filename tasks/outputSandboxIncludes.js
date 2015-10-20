'use strict';

var files = require('./constants/files');
var path = require('path');

module.exports = function(gulp) {
  gulp.task('sandbox:outputSandboxIncludes', function() {
    return gulp
      .src(path.resolve(__dirname, '..', files.SANDBOX_INCLUDES_DIRNAME, '**/*'))
      .pipe(gulp.dest(path.join(files.OUTPUT_DIRNAME, files.OUTPUT_INCLUDES_DIRNAME)));
  });
};
