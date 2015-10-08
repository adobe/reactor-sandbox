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

var CONTAINER_TEMPLATE_FILENAME = 'container.txt';
var CONTAINER_OUTPUT_FILENAME = 'container.js';
var HTML_TEMPLATE_FILENAME = 'index.html';
var EXTENSION_DESCRIPTOR_FILENAME = 'extension.json';
var OUTPUT_DIRNAME = 'dist';
var TEMPLATES_DIRNAME = 'buildTemplates';

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
  gulp.task('copyTemplates', function() {
    var templatesToCopy = [];

    // Only copy these files into the project's templates directory if they don't already exist
    // there. This allows the engineer to make edits to index.html and container.txt for testing
    // purposes.

    try {
      fs.lstatSync(path.join(TEMPLATES_DIRNAME, HTML_TEMPLATE_FILENAME));
    } catch (e) {
      templatesToCopy.push(path.join(__dirname, TEMPLATES_DIRNAME, HTML_TEMPLATE_FILENAME));
    }

    try {
      fs.lstatSync(path.join(TEMPLATES_DIRNAME, CONTAINER_TEMPLATE_FILENAME));
    } catch (e) {
      templatesToCopy.push(path.join(__dirname, TEMPLATES_DIRNAME, CONTAINER_TEMPLATE_FILENAME));
    }

    if (templatesToCopy.length) {
      return gulp
        .src(templatesToCopy)
        .pipe(gulp.dest(TEMPLATES_DIRNAME));
    }
  });

  gulp.task('copyHTMLToOutput', ['copyTemplates'], function() {
    return gulp
      .src(path.join(TEMPLATES_DIRNAME, HTML_TEMPLATE_FILENAME))
      .pipe(gulp.dest(OUTPUT_DIRNAME));
  });

  gulp.task('buildContainer', ['copyTemplates'], function() {
    // When running this task from a turbine extension project we want to include the
    // extension.json from that extension as well as any extensions we find under its
    // node_modules.
    // When running this task from within this builder project we really only care
    // about any extensions we find under this project's node_modules.
    var extensionDescriptorPaths = glob.sync('{node_modules/*/,}' + EXTENSION_DESCRIPTOR_FILENAME);

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

    var container = gulp.src(path.join(TEMPLATES_DIRNAME, CONTAINER_TEMPLATE_FILENAME));

    ALL_CAPABILITY_NAMES.forEach(function(capabilityName) {
      container = container.pipe(
        replace('{{' + capabilityName + '}}',
          stringifyUsingLiteralFunctions(capabilities[capabilityName])));
    });

    return container
      .pipe(rename(CONTAINER_OUTPUT_FILENAME))
      .pipe(gulp.dest(OUTPUT_DIRNAME));
  });

  var pkg = require('./package.json');

  // If we're running this builder from the turbine project then buildEngine is already
  // added as a task and there is no reason to run it indirectly.
  if (pkg.name !== 'turbine') {
    gulp.task('buildEngine', function() {
      var turbinePath = path.join('node_modules/turbine');

      execSync('gulp buildEngine', {
        cwd: turbinePath,
        stdio: [0, 1, 2] // Output the child's process output to the console.
      });

      return gulp
        .src(path.join(turbinePath, path.join(OUTPUT_DIRNAME, 'engine.js')))
        .pipe(gulp.dest(OUTPUT_DIRNAME));
    });
  }

  gulp.task('watch', ['copyTemplates'], function() {
    gulp.watch(path.join(TEMPLATES_DIRNAME, CONTAINER_TEMPLATE_FILENAME), ['buildContainer']);
    gulp.watch(path.join(TEMPLATES_DIRNAME, HTML_TEMPLATE_FILENAME), ['copyHTMLToOutput']);
  });

  gulp.task('serve', ['copyHTMLToOutput', 'buildContainer', 'buildEngine'], function() {
    return gulp.src(OUTPUT_DIRNAME)
      .pipe(webserver({
        port: 7000,
        livereload: true,
        open: true
      }));
  });

  gulp.task('default', [
    'copyTemplates',
    'copyHTMLToOutput',
    'buildEngine',
    'buildContainer',
    'serve',
    'watch'
  ]);
};
