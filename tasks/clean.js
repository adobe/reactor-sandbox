'use strict';

var del = require('del');
var path = require('path');
var files = require('./constants/files');

module.exports = function(gulp) {
  gulp.task('sandbox:clean', function() {
    return del.sync([
      path.resolve(files.TEMPLATES_DIRNAME),
      path.resolve(files.OUTPUT_DIRNAME)
    ]);
  });
};
