'use strict';

module.exports = function(gulp) {
  gulp.task('sandbox:sandbox', [
    'turbine:build',
    'sandbox:initTemplates',
    'sandbox:outputContainer',
    'sandbox:watchContainerSource',
    'sandbox:outputEngine',
    'sandbox:outputExtensionViews',
    'sandbox:outputViewSandboxHTML',
    'sandbox:outputLibSandboxHTML',
    'sandbox:outputSandboxIncludes',
    'sandbox:watchSandboxHTMLTemplates',
    'sandbox:serve'
  ]);
};
