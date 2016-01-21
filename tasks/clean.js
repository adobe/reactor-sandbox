'use strict';

var del = require('del');
var path = require('path');
var files = require('./constants/files');
var packageDescriptor = require('./helpers/getPackageDescriptor')();

module.exports = function(gulp) {
  gulp.task('sandbox:clean', function() {
    var paths = [
      path.resolve(files.OUTPUT_DIRNAME)
    ];

    if (packageDescriptor.name !== 'turbine-gulp-sandbox') {
      paths.push(path.resolve(files.TEMPLATES_DIRNAME));
    }

    return del.sync(paths);
  });
};
