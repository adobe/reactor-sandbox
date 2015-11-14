'use strict';

var fs = require('fs');
var glob = require('glob');
var path = require('path');
var replace = require('gulp-replace');
var rename = require('gulp-rename');
var files = require('./constants/files');

var CAPABILITIES = [
  'events',
  'conditions',
  'actions',
  'dataElements',
  'resources'
];

function wrapInFunction(content, argNames) {
  var argsStr = argNames ? argNames.join(', ') : '';
  return 'function(' + argsStr + ') {\n' + content + '}\n';
}

function stringifyUsingLiteralFunctions(delegates) {
  return JSON.stringify(delegates)
    .replace(/(".+?":)"(function.+?}\\n)"/g, '$1$2')
    .replace(/\\n/g, '\n');
}

var augmentCapabilities = function(extensionOutput, extensionDescriptor, libBasePath) {
  CAPABILITIES.forEach(function(capability) {
    if (extensionDescriptor.hasOwnProperty(capability)) {
      extensionOutput[capability] = extensionOutput[capability] || {};
      var capabilityDescriptors = extensionDescriptor[capability];

      capabilityDescriptors.forEach(function(capabilityDescriptor) {
        var capabilityPath = path.join(libBasePath, capabilityDescriptor[files.LIB_PATH_ATTR]);
        var script = fs.readFileSync(capabilityPath, {encoding: 'utf8'});
        var id;

        // events, conditions, actions, and data element delegates don't have names. We need
        // to give them a unique ID.
        if (capability === 'resources') {
          id = capabilityDescriptor.name;
        } else {
          id = extensionDescriptor.name + '.' +
            path.basename(capabilityPath, path.extname(capabilityPath));
        }

        extensionOutput[capability][id] = wrapInFunction(script, ['module', 'require']);
      });
    }
  });
};

var containerTemplatePath = path.join(files.TEMPLATES_DIRNAME, files.CONTAINER_TEMPLATE_FILENAME);

module.exports = function(gulp) {
  var outputContainer = function() {
    // When running this task from a turbine extension project we want to include the
    // extension descriptor from that extension as well as any extensions we find under its
    // node_modules.
    // When running this task from within this builder project we really only care
    // about any extensions we find under this project's node_modules.
    var extensionDescriptorPaths = glob.sync('{node_modules/*/,}' +
    files.EXTENSION_DESCRIPTOR_FILENAME);

    var extensionsOutput = {};

    extensionDescriptorPaths.forEach(function(extensionDescriptorPath) {
      var extensionDescriptor = require(path.resolve(extensionDescriptorPath));

      var extensionOutput = {
        displayName: extensionDescriptor.displayName
      };

      extensionsOutput[extensionDescriptor.name] = extensionOutput;

      var extensionPath = path.dirname(extensionDescriptorPath);
      var libBasePath = path.join(extensionPath, extensionDescriptor.libBasePath);
      augmentCapabilities(extensionOutput, extensionDescriptor, libBasePath);
    });

    var container = gulp.src(containerTemplatePath);

    container = container.pipe(
      replace(
        '{{extensions}}',
        stringifyUsingLiteralFunctions(extensionsOutput)
      )
    );

    return container
      .pipe(rename(files.CONTAINER_OUTPUT_FILENAME))
      .pipe(gulp.dest(path.join(files.OUTPUT_DIRNAME, files.OUTPUT_INCLUDES_DIRNAME, 'js')));
  };

  gulp.task('sandbox:outputContainer', ['sandbox:initTemplates'], function() {
    gulp.watch(
      [
        path.resolve(containerTemplatePath),
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
