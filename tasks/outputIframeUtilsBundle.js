'use strict';

var path = require('path');
var files = require('./constants/files');

module.exports = function(gulp) {
  gulp.task('sandbox:outputIframeUtilsBundle', ['windgoggles:buildIframeUtils'], function() {
    var bundlePath = path.dirname(require.resolve('turbine-windgoggles'));

    return gulp
      .src(path.join(bundlePath, 'dist', '/**/*'))
      .pipe(gulp.dest(path.join(files.OUTPUT_DIRNAME, files.OUTPUT_INCLUDES_DIRNAME)));
  });
};
