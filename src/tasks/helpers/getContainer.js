'use strict';

var fs = require('fs');
var path = require('path');
var files = require('../constants/files');
var getRequiredPaths = require('@reactor/get-required-paths');
var extensionDescriptorPaths = require('./extensionDescriptorPaths');

var FEATURE_TYPES = [
  'events',
  'conditions',
  'actions',
  'dataElements',
  'sharedModules'
];

var DEFAULT_CONTAINER_TEMPLATE_PATH = path.resolve(
  files.CLIENT_SRC_PATH,
  files.CONTAINER_FILENAME
);

var CONSUMER_CONTAINER_TEMPLATE_PATH = path.resolve(
  files.CONSUMER_CLIENT_SRC_PATH,
  files.CONTAINER_FILENAME);

function wrapInFunction(content, argNames) {
  var argsStr = argNames ? argNames.join(', ') : '';
  return 'function(' + argsStr + ') {\n' + content + '\n}\n';
}

var functionTokenRegistry = {
  _tokenIdCounter: 0,
  _functionStrByToken: {},
  FUNCTION_TOKEN_REGEX: /"\{\{sandbox:function:(.+?)\}\}"/g,
  getToken: function(functionStr) {
    var tokenId = ++this._tokenIdCounter;
    this._functionStrByToken[tokenId] = functionStr;
    return '{{sandbox:function:' + tokenId + '}}';
  },
  getFunctionStr: function(tokenId) {
    return this._functionStrByToken[tokenId];
  }
};

var augmentModule = function(modulesOutput, extensionName, extensionPath, modulePath, moduleMeta) {
  var source = fs.readFileSync(modulePath, {encoding: 'utf8'});
  var requiredRelativePaths = getRequiredPaths(source);

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
      script: functionTokenRegistry.getToken(wrapInFunction(source, ['module', 'exports', 'require']))
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

/**
 * Adds a Sandbox extension to the container with some simple events that sandbox users can use in
 * their rules.
 */
var augmentSandboxEvents = function(extensionsOutput) {
  if (!extensionsOutput.sandbox) { // Check to see if the extension under test is named sandbox.
    extensionsOutput.sandbox = {
      displayName: 'Extension Sandbox',
      modules: {
        'sandbox/click.js': {
          displayName: 'Click',
          script: function(module) {
            module.exports = function(settings, trigger) {
              document.addEventListener('click', function() {
                trigger();
              });
            };
          }
        },
        'sandbox/pageTop.js': {
          displayName: 'Page Top',
          script: function(module) {
            module.exports = function(settings, trigger) {
              trigger();
            };
          }
        }
      }
    }
  }
};

module.exports = function() {
  // When running this task from a turbine extension project we want to include the
  // extension descriptor from that extension as well as any extensions we find under its
  // node_modules.
  // When running this task from within this builder project we care about any extensions we find
  // under this project's node_modules or under a folder starting with @(as for npm scopes).
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
    // template. This is a common use case when an extension developer wants to test a certain
    // extension configuration.
    var extensionOutput = extensionsOutput[extensionDescriptor.name];

    if (!extensionOutput) {
      extensionOutput = extensionsOutput[extensionDescriptor.name] = {};
    }

    extensionOutput.displayName = extensionOutput.displayName || extensionDescriptor.displayName;
    extensionOutput.hostedLibFilesBaseUrl =
      '/hostedLibFiles/' + extensionDescriptor.name + '/' + extensionDescriptor.version + '/';

    augmentModules(extensionOutput, extensionDescriptor, extensionPath);
  });

  augmentSandboxEvents(extensionsOutput);

  // Stringify the container so we can wrap it with some additional code (see down below).
  container = JSON.stringify(container, function(key, value) {
    // When consumers have placed functions in their container, we need to maintain them as
    // executable functions in the final output. Consumers may place functions in their container
    // in order to simulate the "function" transform that typically occurs on the server.
    if (typeof value === 'function') {
      return functionTokenRegistry.getToken(value.toString());
    }

    return value;
  }, 2);

  // Replace all function tokens in the JSON with executable functions.
  container = container.replace(functionTokenRegistry.FUNCTION_TOKEN_REGEX, function(token, tokenId) {
    return functionTokenRegistry.getFunctionStr(tokenId);
  });

  container = '' +
    '(function() {\n' +
    '  window._satellite = window._satellite || {};\n' +
    '  window._satellite.container = ' + container + '\n' +
    '})();';

  return container;
};
