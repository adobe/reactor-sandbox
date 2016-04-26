'use strict';

var fs = require('fs');
var glob = require('glob');
var path = require('path');
var files = require('./constants/files');
var mkdirp = require('mkdirp');

var DELEGATE_TYPES = [
  'events',
  'conditions',
  'actions',
  'dataElements'
];

var CONTAINER_TEMPLATE_PATH = path.resolve(
  files.TEMPLATES_DIRNAME,
  files.CONTAINER_TEMPLATE_FILENAME);

var CONTAINER_OUTPUT_PATH = path.join(
  files.OUTPUT_DIRNAME,
  files.OUTPUT_INCLUDES_DIRNAME,
  'js');

function wrapInFunction(content, argNames) {
  var argsStr = argNames ? argNames.join(', ') : '';
  return 'function(' + argsStr + ') {\n' + content + '}\n';
}

function stringifyUsingLiteralFunctions(container) {
  return JSON.stringify(container, null, 2)
    .replace(/(".+?": )"(function.+?})\\n"/g, '$1$2')
    .replace(/\\n/g, '\n');
}

var augmentDelegates = function(extensionOutput, extensionDescriptor, libBasePath) {
  extensionOutput.delegates = extensionOutput.delegates || {};

  DELEGATE_TYPES.forEach(function(delegateType) {
    if (extensionDescriptor.hasOwnProperty(delegateType)) {
      var delegateDescriptors = extensionDescriptor[delegateType];

      if (delegateDescriptors) {
        delegateDescriptors.forEach(function(delegateDescriptor) {
          var id = extensionDescriptor.name + '/' + delegateType + '/' + delegateDescriptor.name;

          if (!extensionOutput.delegates[id]) {
            var delegateLibPath = path.join(libBasePath, delegateDescriptor[files.LIB_PATH_ATTR]);
            var script = fs.readFileSync(delegateLibPath, {encoding: 'utf8'});
            extensionOutput.delegates[id] = {
              displayName: delegateDescriptor.displayName,
              script: wrapInFunction(script, ['module', 'require'])
            };
          }
        });
      }
    }
  });
};

var augmentHelpers = function(extensionOutput, extensionDescriptor, libBasePath) {
  extensionOutput.helpers = extensionOutput.helpers || {};

  var helperDescriptors = extensionDescriptor.helpers;

  if (helperDescriptors) {
    helperDescriptors.forEach(function(helperDescriptor) {
      var id = extensionDescriptor.name + '/helpers/' + helperDescriptor.name;

      if (!extensionOutput.helpers[id]) {
        var helperLibPath = path.join(libBasePath, helperDescriptor[files.LIB_PATH_ATTR]);
        var script = fs.readFileSync(helperLibPath, {encoding: 'utf8'});
        extensionOutput.helpers[id] = {
          script: wrapInFunction(script, ['module', 'require'])
        };
      }
    });
  }
};

module.exports = function(gulp) {
  var outputContainer = function() {
    // When running this task from a turbine extension project we want to include the
    // extension descriptor from that extension as well as any extensions we find under its
    // node_modules.
    // When running this task from within this builder project we really only care
    // about any extensions we find under this project's node_modules.
    var extensionDescriptorPaths = glob.sync('{node_modules/*/,}' +
    files.EXTENSION_DESCRIPTOR_FILENAME);

    // Make sure we get the latest.
    delete require.cache[CONTAINER_TEMPLATE_PATH];
    var container = require(CONTAINER_TEMPLATE_PATH);
    var extensionsOutput = container.extensions;

    if (!extensionsOutput) {
      extensionsOutput = container.extensions = {};
    }

    extensionDescriptorPaths.forEach(function(extensionDescriptorPath) {
      var extensionDescriptor = require(path.resolve(extensionDescriptorPath));

      // We take care to not just overwrite extensionsOutput[extensionDescriptor.name] because
      // Extension A may be pulled in from node_modules AND the extension developer using the
      // sandbox may have already coded in some stuff for Extension A within their container.js
      // template. This is a common use case when an extension developer wants to test certain
      // extension configurations.
      var extensionOutput = extensionsOutput[extensionDescriptor.name];

      if (!extensionOutput) {
        extensionOutput = extensionsOutput[extensionDescriptor.name] = {};
      }

      extensionOutput.name = extensionOutput.name || extensionDescriptor.name;
      extensionOutput.displayName = extensionOutput.displayName || extensionDescriptor.displayName;

      var extensionPath = path.dirname(extensionDescriptorPath);
      var libBasePath = path.join(extensionPath, extensionDescriptor.libBasePath);
      augmentDelegates(extensionOutput, extensionDescriptor, libBasePath);
      augmentHelpers(extensionOutput, extensionDescriptor, libBasePath);
    });

    container = stringifyUsingLiteralFunctions(container);
    container = '' +
      '(function() {\n' +
      '  window._satellite = window._satellite || {};\n' +
      '  window._satellite.container = ' + container + '\n' +
      '})();';

    mkdirp.sync(CONTAINER_OUTPUT_PATH);
    fs.writeFileSync(path.join(CONTAINER_OUTPUT_PATH, files.CONTAINER_OUTPUT_FILENAME), container);
  };

  gulp.task('sandbox:outputContainer', ['sandbox:initTemplates'], outputContainer);

  gulp.task('sandbox:watchOutputContainer', ['sandbox:initTemplates'], function() {
    gulp.watch(
      [
        path.resolve(CONTAINER_TEMPLATE_PATH),
        path.join(files.SRC_DIRNAME, files.SRC_FILENAMES)
      ],
      function() {
        console.log('Container source change detected. Republished.');
        outputContainer();
      }
    );
  });
};
