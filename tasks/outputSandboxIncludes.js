'use strict';

var files = require('./constants/files');
var path = require('path');

var sources = [
  path.resolve(__dirname, '..', files.SANDBOX_INCLUDES_DIRNAME, '**/*'),
  require.resolve('jschannel')
];


module.exports = function(gulp) {
  var outputSandboxIncludes = function() {
    return gulp
      .src(sources)
      .pipe(gulp.dest(path.join(files.OUTPUT_DIRNAME, files.OUTPUT_INCLUDES_DIRNAME)));
  };

  gulp.task('sandbox:outputSandboxIncludes', function() {
    gulp.watch(sources, function() {
      console.log('Sandbox includes change detected. Republished.');
      outputSandboxIncludes();
    });
    return outputSandboxIncludes();
  });
};
