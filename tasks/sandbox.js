'use strict';

module.exports = function(gulp) {
  gulp.task('sandbox:sandbox', [
    'sandbox:initTemplates',
    'sandbox:outputContainer',
    'sandbox:outputEngine',
    'sandbox:outputExtensionViews',
    'sandbox:outputSandboxHtml',
    'sandbox:outputSandboxIncludes',
    'sandbox:outputIframeBundle',
    'sandbox:serve',
    'sandbox:watchSandboxIncludes'
  ]);
};
