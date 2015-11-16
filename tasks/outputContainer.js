'use strict';

var fs = require('fs');
var glob = require('glob');
var path = require('path');
var files = require('./constants/files');

var CAPABILITIES = [
  'events',
  'conditions',
  'actions',
  'dataElements',
  'resources'
];

var CONTAINER_TEMPLATE_PATH = path.resolve(
  files.TEMPLATES_DIRNAME,
  files.CONTAINER_TEMPLATE_FILENAME);

var CONTAINER_OUTPUT_PATH = path.join(
  files.OUTPUT_DIRNAME,
  files.OUTPUT_INCLUDES_DIRNAME,
  'js',
  files.CONTAINER_OUTPUT_FILENAME);

function wrapInFunction(content, argNames) {
  var argsStr = argNames ? argNames.join(', ') : '';
  return 'function(' + argsStr + ') {\n' + content + '}\n';
}

function stringifyUsingLiteralFunctions(container) {
  return JSON.stringify(container, null, 2)
    .replace(/(".+?": )"(function.+?})\\n"/g, '$1$2')
    .replace(/\\n/g, '\n');
}

var augmentCapabilities = function(extensionOutput, extensionDescriptor, libBasePath) {
  CAPABILITIES.forEach(function(capability) {
    if (extensionDescriptor.hasOwnProperty(capability)) {
      extensionOutput[capability] = extensionOutput[capability] || {};
      var capabilityDescriptors = extensionDescriptor[capability];

      capabilityDescriptors.forEach(function(capabilityDescriptor) {
        var capabilityPath = path.join(libBasePath, capabilityDescriptor[files.LIB_PATH_ATTR]);
        var id;

        // events, conditions, actions, and data element delegates don't have names. We need
        // to give them a unique ID.
        if (capability === 'resources') {
          id = capabilityDescriptor.name;
        } else {
          id = extensionDescriptor.name + '.' +
            path.basename(capabilityPath, path.extname(capabilityPath));
        }

        if (!extensionOutput[capability][id]) {
          var script = fs.readFileSync(capabilityPath, {encoding: 'utf8'});
          extensionOutput[capability][id] = wrapInFunction(script, ['module', 'require']);
        }
      });
    }
  });
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

    extensionDescriptorPaths.forEach(function(extensionDescriptorPath) {
      var extensionDescriptor = require(path.resolve(extensionDescriptorPath));

      var extensionOutput = extensionsOutput[extensionDescriptor.name];

      if (!extensionOutput) {
        extensionOutput = extensionsOutput[extensionDescriptor.name] = {};
      }

      extensionOutput.displayName = extensionOutput.displayName || extensionDescriptor.displayName;

      var extensionPath = path.dirname(extensionDescriptorPath);
      var libBasePath = path.join(extensionPath, extensionDescriptor.libBasePath);
      augmentCapabilities(extensionOutput, extensionDescriptor, libBasePath);
    });

    container = stringifyUsingLiteralFunctions(container);
    container = '' +
      '(function() {\n' +
      '  window._satellite = window._satellite || {};\n' +
      '  window._satellite.container = ' + container + '\n' +
      '})();';

    fs.writeFileSync(CONTAINER_OUTPUT_PATH, container);
  };

  gulp.task('sandbox:outputContainer', ['sandbox:initTemplates'], function() {
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

    return outputContainer();
  });
};
