'use strict';

var files = require('./constants/files');
var path = require('path');
var webpack = require('webpack-stream');
var insert = require('gulp-insert');
var getExtensionDescriptor = require('./helpers/getExtensionDescriptor');

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
      .pipe(webpack({
        output: {filename: 'viewSandbox.js'},
        // AJV needs json-loader.
        module: {
          loaders: [
            {
              'test': /\.json$/,
              'loader': 'json'
            }
          ]
        },
        node: {
          fs: 'empty'
        }
      }))
      .pipe(gulp.dest(path.join(files.OUTPUT_DIRNAME, files.OUTPUT_INCLUDES_DIRNAME, 'js')));
  });

  gulp.task('sandbox:outputSandboxIncludes', ['sandbox:outputSandboxIncludes:copyFiles', 'sandbox:outputSandboxIncludes:webpackBuild'], function() {
    return gulp
      .src([
        path.join(files.OUTPUT_DIRNAME, files.OUTPUT_INCLUDES_DIRNAME, 'js/viewSandbox.js')
      ])
      .pipe(insert.prepend('var extensionDescriptor = ' +  JSON.stringify(getExtensionDescriptor()) + ';\n\n'))
      .pipe(gulp.dest(path.join(files.OUTPUT_DIRNAME, files.OUTPUT_INCLUDES_DIRNAME, 'js')));
  });

  gulp.task('sandbox:watchSandboxIncludes', ['sandbox:outputSandboxIncludes'], function() {
    var watchSources = sources.slice();
    watchSources.push(path.resolve(files.EXTENSION_DESCRIPTOR_FILENAME));
    gulp.watch(watchSources, ['sandbox:outputSandboxIncludes']);
  });
};
