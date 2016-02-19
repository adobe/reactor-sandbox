'use strict';

module.exports = function(gulp) {
  gulp.task('sandbox:compile', [
    'sandbox:initTemplates',
    'sandbox:outputContainer',
    'sandbox:outputEngine',
    'sandbox:outputExtensionViews',
    'sandbox:outputSandboxHtml',
    'sandbox:outputSandboxIncludes',
    'sandbox:outputIframeBundle'
  ]);

  gulp.task('sandbox:sandbox', [
    'sandbox:compile',
    'sandbox:serve',
    'sandbox:watchOutputContainer',
    'sandbox:watchOutputExtensionViews',
    'sandbox:watchOutputSandboxHtml',
    'sandbox:watchSandboxIncludes'
  ]);
};
