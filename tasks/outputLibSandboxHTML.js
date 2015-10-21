'use strict';

var path = require('path');
var files = require('./constants/files');

var source = path.resolve(files.TEMPLATES_DIRNAME, files.LIB_SANDBOX_TEMPLATE_FILENAME);


module.exports = function(gulp) {
  var outputLibSandboxHTML = function() {
    return gulp
      .src(source)
      .pipe(gulp.dest(files.OUTPUT_DIRNAME));
  };

  gulp.task('sandbox:outputLibSandboxHTML', ['sandbox:initTemplates'], function() {
    gulp.watch(source, function() {
      console.log('Library sandbox HTML change detected. Republished.');
      outputLibSandboxHTML();
    });
    return outputLibSandboxHTML();
  });
};
