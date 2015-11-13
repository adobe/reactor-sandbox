'use strict';

var files = require('./constants/files');
var path = require('path');
var webpack = require('webpack-stream');
var insert = require('gulp-insert');
var extensionDescriptor = require('./helpers/extensionDescriptor');

var sources = [
  path.resolve(__dirname, '..', files.SANDBOX_INCLUDES_DIRNAME, '**/*')
];

module.exports = function(gulp) {
  gulp.task('sandbox:outputSandboxIncludes:copyFiles', function() {
    return gulp
      .src(sources)
      .pipe(gulp.dest(path.join(files.OUTPUT_DIRNAME, files.OUTPUT_INCLUDES_DIRNAME)));
  });

  gulp.task('sandbox:outputSandboxIncludes:webpackBuild', function() {
    return gulp
      .src([path.join(__dirname, '..', files.SANDBOX_INCLUDES_DIRNAME, '**/viewSandbox.js')])
      .pipe(webpack({output: {filename: 'viewSandbox.js'}}))
      .pipe(gulp.dest(path.join(files.OUTPUT_DIRNAME, files.OUTPUT_INCLUDES_DIRNAME, 'js')));
  });

  gulp.task('sandbox:outputSandboxIncludes', ['sandbox:outputSandboxIncludes:copyFiles', 'sandbox:outputSandboxIncludes:webpackBuild'], function() {
    return gulp
      .src([
        path.join(files.OUTPUT_DIRNAME, files.OUTPUT_INCLUDES_DIRNAME, 'js/viewSandbox.js')
      ])
      .pipe(insert.prepend('var extensionDescriptor = ' +  JSON.stringify(extensionDescriptor) + ';\n\n'))
      .pipe(gulp.dest(path.join(files.OUTPUT_DIRNAME, files.OUTPUT_INCLUDES_DIRNAME, 'js')));
  });

  gulp.task('sandbox:watchSandboxIncludes', ['sandbox:outputSandboxIncludes'], function() {
    gulp.watch(sources, ['sandbox:outputSandboxIncludes']);
  });
};
