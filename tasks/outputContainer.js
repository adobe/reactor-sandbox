'use strict';

var fs = require('fs');
var glob = require('glob');
var path = require('path');
var replace = require('gulp-replace');
var rename = require('gulp-rename');
var files = require('./constants/files');

var DELEGATE_CAPABILITY_NAMES = [
  'eventDelegates',
  'conditionDelegates',
  'actionDelegates',
  'dataElementDelegates'
];

var ALL_CAPABILITY_NAMES = [
  'resources'
].concat(DELEGATE_CAPABILITY_NAMES);

function wrapInFunction(content, argNames) {
  var argsStr = argNames ? argNames.join(', ') : '';
  return 'function(' + argsStr + ') {\n' + content + '}\n';
}

function stringifyUsingLiteralFunctions(delegates) {
  return JSON.stringify(delegates)
    .replace(/(".+?":)"(function.+?}\\n)"/g, '$1$2')
    .replace(/\\n/g, '\n');
}

var augmentDelegates = function(capabilities, extensionDescriptor, libBasePath) {
  DELEGATE_CAPABILITY_NAMES.forEach(function(capabilityName) {
    capabilities[capabilityName] = capabilities[capabilityName] || {};

    if (extensionDescriptor.hasOwnProperty(capabilityName)) {
      var delegateDescriptors = extensionDescriptor[capabilityName];

      delegateDescriptors.forEach(function(delegateDescriptor) {
        var delegatePath = path.join(libBasePath, delegateDescriptor[files.LIB_PATH_ATTR]);
        var script = fs.readFileSync(delegatePath, {encoding: 'utf8'});
        var id = extensionDescriptor.name + '.' +
          path.basename(delegatePath, path.extname(delegatePath));
        capabilities[capabilityName][id] = wrapInFunction(script, ['module', 'require']);
      });
    }
  });
};

var augmentResources = function(capabilities, extensionDescriptor, libBasePath) {
  if (extensionDescriptor.hasOwnProperty('resources')) {
    var resourceDescriptors = extensionDescriptor.resources;
    resourceDescriptors.forEach(function(resourceDescriptor) {
      var resourcePath = path.join(libBasePath, resourceDescriptor[files.LIB_PATH_ATTR]);
      var script = fs.readFileSync(resourcePath, {encoding: 'utf8'});
      var id = extensionDescriptor.name + '/' + resourceDescriptor.name;
      capabilities.resources[id] = wrapInFunction(script, ['module', 'require']);
    });
  }
};

module.exports = function(gulp) {
  gulp.task(
    'sandbox:outputContainer',
    ['sandbox:initTemplates'],
    function() {

      // When running this task from a turbine extension project we want to include the
      // extension descriptor from that extension as well as any extensions we find under its
      // node_modules.
      // When running this task from within this builder project we really only care
      // about any extensions we find under this project's node_modules.
      var extensionDescriptorPaths = glob.sync('{node_modules/*/,}' +
        files.EXTENSION_DESCRIPTOR_FILENAME);

      var capabilities = {};

      ALL_CAPABILITY_NAMES.forEach(function(capabilityName) {
        capabilities[capabilityName] = {};
      });

      extensionDescriptorPaths.forEach(function(extensionDescriptorPath) {
        var extensionDescriptor = require(path.resolve(extensionDescriptorPath));
        var extensionPath = path.dirname(extensionDescriptorPath);
        var libBasePath = path.join(extensionPath, extensionDescriptor.libBasePath);
        augmentDelegates(capabilities, extensionDescriptor, libBasePath);
        augmentResources(capabilities, extensionDescriptor, libBasePath);
      });

      var container = gulp.src(
        path.join(files.TEMPLATES_DIRNAME, files.CONTAINER_TEMPLATE_FILENAME));

      ALL_CAPABILITY_NAMES.forEach(function(capabilityName) {
        container = container.pipe(
          replace('{{' + capabilityName + '}}',
            stringifyUsingLiteralFunctions(capabilities[capabilityName])));
      });

      return container
        .pipe(rename(files.CONTAINER_OUTPUT_FILENAME))
        .pipe(gulp.dest(path.join(files.OUTPUT_DIRNAME, files.OUTPUT_INCLUDES_DIRNAME)));
    }
  );
};
