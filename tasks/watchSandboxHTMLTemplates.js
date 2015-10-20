var path = require('path');
var files = require('./constants/files');

module.exports = function(gulp) {
  gulp.task('sandbox:watchSandboxHTMLTemplates', ['sandbox:initTemplates'], function() {
    gulp.watch(
      path.resolve(files.TEMPLATES_DIRNAME, files.LIB_SANDBOX_TEMPLATE_FILENAME),
      ['sandbox:outputLibSandboxHTML']
    );

    gulp.watch(
      path.resolve(files.TEMPLATES_DIRNAME, files.VIEW_SANDBOX_TEMPLATE_FILENAME),
      ['sandbox:outputViewSandboxHTML']
    );
  });
};
