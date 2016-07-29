'use strict';

var fs = require('fs');
var glob = require('glob');
var path = require('path');
var files = require('../constants/files');

var FEATURE_TYPES = [
  'events',
  'conditions',
  'actions',
  'dataElements',
  'sharedModules'
];

var PATH_REQUIRE_REGEX = /require\(['"](\.{1,2}\/.*?)['"]\)/g;

var DEFAULT_CONTAINER_TEMPLATE_PATH = path.resolve(
  files.CLIENT_SRC_PATH,
  files.CONTAINER_FILENAME
);

var CONSUMER_CONTAINER_TEMPLATE_PATH = path.resolve(
  files.CONSUMER_CLIENT_SRC_PATH,
  files.CONTAINER_FILENAME);

function wrapInFunction(content, argNames) {
  var argsStr = argNames ? argNames.join(', ') : '';
  return 'function(' + argsStr + ') {\n' + content + '}\n';
}

var getModuleToken = function(path) {
  return '{{module:' + path + '}}';
};

var getRequiredPaths = function(script) {
  var match;
  var paths = [];

  while (match = PATH_REQUIRE_REGEX.exec(script)) {
    paths.push(match[1]);
  }

  return paths;
};

var augmentModule = function(modulesOutput, extensionName, extensionPath, modulePath, moduleMeta) {
  // The file is currently read here to scan for relative paths being required. It's then read
  // again later after the container's object has been converted to JSON and module tokens
  // are replaced with module contents. We could cache the contents in memory later if necessary.
  var script = fs.readFileSync(modulePath, {encoding: 'utf8'});
  var requiredRelativePaths = getRequiredPaths(script);

  requiredRelativePaths.forEach(function(requiredRelativePath) {
    var requiredPath = path.resolve(path.dirname(modulePath), requiredRelativePath);
    augmentModule(modulesOutput, extensionName, extensionPath, requiredPath, {});
  });

  // The reference path is a unique path that starts with the extension name, then a slash,
  // then the path to the file within the extension's directory.
  var referencePath = path.join(extensionName, path.relative(extensionPath, modulePath));

  // It's possible this module has already been added to the output. If it has, we just need to
  // merge any new meta information that hasn't already been stored for the module. This supports
  // certain cases where a module could be an action delegate AND required via relative path
  // by an event delegate AND be a shared module.
  var moduleOutput = modulesOutput[referencePath];

  if (!moduleOutput) {
    moduleOutput = modulesOutput[referencePath] = {
      // We use a special token that indicates that after the container is serialized
      // to JSON that the token should be replaced with an actual, executable function
      // which wraps the delegate code. We can't just set the value to a function right
      // now because it wouldn't be properly serialized.
      script: getModuleToken(modulePath)
    };
  }

  // Merge meta information.
  Object.keys(moduleMeta).forEach(function(key) {
    if (!moduleOutput.hasOwnProperty(key)) {
      moduleOutput[key] = moduleMeta[key];
    }
  });
};

var augmentModules = function(extensionOutput, extensionDescriptor, extensionPath) {
  extensionOutput.modules = extensionOutput.modules || {};

  FEATURE_TYPES.forEach(function(featureType) {
    if (extensionDescriptor.hasOwnProperty(featureType)) {
      var featureDescriptors = extensionDescriptor[featureType];

      if (featureDescriptors) {
        featureDescriptors.forEach(function(featureDescriptor) {
          var modulePath = path.join(
            extensionPath,
            extensionDescriptor.libBasePath || '',
            featureDescriptor.libPath);

          var moduleMeta = {};

          if (featureType === 'sharedModules') {
            moduleMeta.sharedName = featureDescriptor.name;
          }
          
          if (featureDescriptor.displayName) {
            moduleMeta.displayName = featureDescriptor.displayName;
          }

          augmentModule(
            extensionOutput.modules,
            extensionDescriptor.name,
            extensionPath,
            modulePath,
            moduleMeta);
        });
      }
    }
  });
};

module.exports = function() {
  // When running this task from a turbine extension project we want to include the
  // extension descriptor from that extension as well as any extensions we find under its
  // node_modules.
  // When running this task from within this builder project we care about any extensions we find
  // under this project's node_modules or under a folder starting with @(as for npm scopes).
  var extensionDescriptorPaths =
    glob.sync('{node_modules/*/,node_modules/@*/*/,}' + files.EXTENSION_DESCRIPTOR_FILENAME);

  var container;

  // Try to use the consumer-defined container first and fallback to the default if they haven't
  // provided one.
  try {
    // Make sure we get the latest.
    delete require.cache[CONSUMER_CONTAINER_TEMPLATE_PATH];
    container = require(CONSUMER_CONTAINER_TEMPLATE_PATH);
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      // Make sure we get the latest.
      delete require.cache[DEFAULT_CONTAINER_TEMPLATE_PATH];
      container = require(DEFAULT_CONTAINER_TEMPLATE_PATH);
    }
  }

  var extensionsOutput = container.extensions;

  if (!extensionsOutput) {
    extensionsOutput = container.extensions = {};
  }

  extensionDescriptorPaths.forEach(function(extensionDescriptorPath) {
    var extensionDescriptor = require(path.resolve(extensionDescriptorPath));
    var extensionPath = path.dirname(path.resolve(extensionDescriptorPath));

    // We take care to not just overwrite extensionsOutput[extensionDescriptor.name] because
    // Extension A may be pulled in from node_modules AND the extension developer using the
    // sandbox may have already coded in some stuff for Extension A within their container.js
    // template. This is a common use case when an extension developer wants to test certain
    // extension configurations.
    var extensionOutput = extensionsOutput[extensionDescriptor.name];

    if (!extensionOutput) {
      extensionOutput = extensionsOutput[extensionDescriptor.name] = {};
    }

    extensionOutput.displayName = extensionOutput.displayName || extensionDescriptor.displayName;

    augmentModules(extensionOutput, extensionDescriptor, extensionPath);
  });

  container = JSON.stringify(container, null, 2);

  // Replace all delegate tokens in the JSON with executable functions that contain the
  // extension's delegate code.
  container = container.replace(/"\{\{module:(.+?)\}\}"/g, function(match, path) {
    var script = fs.readFileSync(path, {encoding: 'utf8'});
    script = wrapInFunction(script, ['module', 'require']);
    return script;
  });

  container = '' +
    '(function() {\n' +
    '  window._satellite = window._satellite || {};\n' +
    '  window._satellite.container = ' + container + '\n' +
    '})();';

  return container;
};
