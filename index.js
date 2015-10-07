'use strict';

var glob = require('glob');
var path = require('path');
var replace = require('gulp-replace');
var rename = require('gulp-rename');
var fs = require('fs');
var execSync = require('child_process').execSync;
var webserver = require('gulp-webserver');

var DELEGATE_CAPABILITY_NAMES = [
  'eventDelegates',
  'conditionDelegates',
  'actionDelegates',
  'dataElementDelegates'
];

var ALL_CAPABILITY_NAMES = [
  'resources'
].concat(DELEGATE_CAPABILITY_NAMES);

var CONTAINER_TEMPLATE_NAME = 'container.txt';
var CONTAINER_OUTPUT_NAME = 'container.js';
var EXTENSION_DESCRIPTOR_NAME = 'extension.json';

function wrapInFunction(content, argNames) {
  var argsStr = argNames ? argNames.join(', ') : '';
  return 'function(' + argsStr + ') {\n' + content + '}\n';
}

function stringifyUsingLiteralFunctions(delegates) {
  return JSON.stringify(delegates)
    .replace(/(".+?":)"(function.+?}\\n)"/g, '$1$2')
    .replace(/\\n/g, '\n');
}

var augmentDelegates = function(capabilities, extensionDescriptor, extensionPath) {
  DELEGATE_CAPABILITY_NAMES.forEach(function(capabilityName) {
    console.log('  ' + capabilityName);
    capabilities[capabilityName] = capabilities[capabilityName] || {};

    if (extensionDescriptor.hasOwnProperty(capabilityName)) {
      var delegateDescriptors = extensionDescriptor[capabilityName];

      delegateDescriptors.forEach(function(delegateDescriptor) {
        var delegatePath = path.join(extensionPath, delegateDescriptor.path);
        var script = fs.readFileSync(delegatePath, {encoding: 'utf8'});
        var id = extensionDescriptor.name + '.' +
          path.basename(delegatePath, path.extname(delegatePath));
        capabilities[capabilityName][id] = wrapInFunction(script, ['module', 'require']);
        console.log('    ' + delegateDescriptor.displayName);
      });
    }
  });
};

var augmentResources = function(capabilities, extensionDescriptor, extensionPath) {
  console.log('  resources');
  if (extensionDescriptor.hasOwnProperty('resources')) {
    var resourceDescriptors = extensionDescriptor.resources;
    resourceDescriptors.forEach(function(resourceDescriptor) {
      var resourcePath = path.join(extensionPath, resourceDescriptor.path);
      var script = fs.readFileSync(resourcePath, {encoding: 'utf8'});
      var id = extensionDescriptor.name + '/' + resourceDescriptor.name;
      capabilities.resources[id] = wrapInFunction(script, ['module', 'require']);
      console.log('    ' + resourceDescriptor.name);
    });
  }
};

module.exports = function(gulp) {
  gulp.task('buildContainer', function() {
    // When running this task from a turbine extension project we want to include the
    // extension.json from that extension as well as any extensions we find under its
    // node_modules.
    // When running this task from within this builder project we really only care
    // about any extensions we find under this project's node_modules.
    var extensionDescriptorPaths = glob.sync('{node_modules/*/,}' + EXTENSION_DESCRIPTOR_NAME);

    var capabilities = {};

    ALL_CAPABILITY_NAMES.forEach(function(capabilityName) {
      capabilities[capabilityName] = {};
    });

    extensionDescriptorPaths.forEach(function(extensionDescriptorPath) {
      var extensionDescriptor =
        JSON.parse(fs.readFileSync(extensionDescriptorPath, {encoding: 'utf8'}));
      console.log(extensionDescriptor.name);
      var extensionPath = path.dirname(extensionDescriptorPath);
      augmentDelegates(capabilities, extensionDescriptor, extensionPath);
      augmentResources(capabilities, extensionDescriptor, extensionPath);
    });

    try {
      fs.lstatSync(CONTAINER_TEMPLATE_NAME);
    } catch (e) {
      throw new Error('A container template named ' + CONTAINER_TEMPLATE_NAME +
      ' must exist in the project.');
    }

    var container = gulp.src([CONTAINER_TEMPLATE_NAME]);

    ALL_CAPABILITY_NAMES.forEach(function(capabilityName) {
      container = container.pipe(
        replace('{{' + capabilityName + '}}',
          stringifyUsingLiteralFunctions(capabilities[capabilityName])));
    });

    return container
      .pipe(rename(CONTAINER_OUTPUT_NAME))
      .pipe(gulp.dest('dist'));
  });

  gulp.task('buildEngine', function() {
    var turbinePath = path.join('node_modules/turbine');

    try {
      fs.lstatSync(turbinePath);
    } catch (e) {
      throw new Error('Turbine must be installed as a dependency of the project.');
    }

    execSync('gulp buildEngine', {
      cwd: turbinePath,
      stdio: [0, 1, 2] // Output the child's process output to the console.
    });

    return gulp
      .src([path.join(turbinePath, 'dist/engine.js')])
      .pipe(gulp.dest('dist'));
  });

  gulp.task('watch', function() {
    return gulp.watch(['container.txt'], ['buildContainer']);
  });

  gulp.task('serve', function() {
    return gulp.src('./')
      .pipe(webserver({
        port: 7000
      }));
  });

  gulp.task('default', ['buildEngine', 'buildContainer', 'serve', 'watch']);
};
