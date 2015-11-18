'use strict';

module.exports = function(gulp) {
  gulp.task('sandbox:sandbox', [
    'turbine:build',
    'sandbox:initTemplates',
    'sandbox:outputContainer',
    'sandbox:outputEngine',
    'sandbox:outputExtensionViews',
    'sandbox:outputSandboxHTMLs',
    'sandbox:outputSandboxIncludes',
    'sandbox:outputIframeBundle',
    'sandbox:serve',
    'sandbox:watchSandboxIncludes'
  ]);
};
