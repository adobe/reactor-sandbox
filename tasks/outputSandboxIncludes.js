'use strict';

var files = require('./constants/files');
var path = require('path');
var eventStream = require('event-stream');
var insert = require('gulp-insert');
var extensionDescriptor = require('./helpers/extensionDescriptor');

var sources = [
  path.resolve(__dirname, '..', files.SANDBOX_INCLUDES_DIRNAME, '**/*')
];

module.exports = function(gulp) {
  gulp.task('sandbox:outputSandboxIncludes:copyFiles', function() {
    var communicationStream = gulp
      .src([
        require.resolve('jschannel'),
        require.resolve('lens-extension-bridge/src/extensionBridge')
      ])
      .pipe(gulp.dest(path.join(files.OUTPUT_DIRNAME, files.OUTPUT_INCLUDES_DIRNAME, 'js')));


    var includesStream = gulp
      .src(sources)
      .pipe(gulp.dest(path.join(files.OUTPUT_DIRNAME, files.OUTPUT_INCLUDES_DIRNAME)));

    return eventStream.merge(communicationStream, includesStream);
  });

  var outputSandboxIncludes = function() {
    return gulp
      .src([
        path.join(files.OUTPUT_DIRNAME, files.OUTPUT_INCLUDES_DIRNAME, 'js/viewSandbox.js')
      ])
      .pipe(insert.prepend('var extensionDescriptor = ' +  JSON.stringify(extensionDescriptor) + ';\n\n'))
      .pipe(gulp.dest(path.join(files.OUTPUT_DIRNAME, files.OUTPUT_INCLUDES_DIRNAME, 'js')));
  };

  gulp.task('sandbox:outputSandboxIncludes', ['sandbox:outputSandboxIncludes:copyFiles'], function() {
    gulp.watch(sources, function() {
      console.log('Sandbox includes change detected. Republished.');
      outputSandboxIncludes();
    });
    return outputSandboxIncludes();
  });
};
