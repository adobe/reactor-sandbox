'use strict';

var path = require('path');
var constants = require('./constants');

module.exports = function(gulp) {
  gulp.task('copyEngine', ['buildEngine'], function() {
    var pkg = require(path.join(process.cwd(), 'package.json'));
    if (pkg.name !== 'turbine') {
      var turbinePath = path.join('node_modules/turbine');
      return gulp
        .src(path.join(turbinePath, path.join(constants.OUTPUT_DIRNAME, 'engine.js')))
        .pipe(gulp.dest(constants.OUTPUT_DIRNAME));
    }
  });
};
