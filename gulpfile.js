'use strict';

var gulp = require('gulp');
var glob = require('glob');
var path = require('path');
var replace = require('gulp-replace');
var rename = require('gulp-rename');
var fs = require('fs');
var exec = require('child_process').exec;
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

gulp.task('buildContainer', function() {
  var extensionDescriptorPaths = glob.sync(path.join(__dirname, 'node_modules/*/extension.json'));

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

  var container = gulp.src(['container.txt']);

  ALL_CAPABILITY_NAMES.forEach(function(capabilityName) {
    container = container.pipe(
      replace('{{' + capabilityName + '}}',
      stringifyUsingLiteralFunctions(capabilities[capabilityName])));
  });

  return container
    .pipe(rename('container.js'))
    .pipe(gulp.dest('./dist'));
});

gulp.task('buildEngine', function() {
  var turbinePath = path.join(__dirname, 'node_modules/turbine');

  exec('gulp buildEngine', {
    cwd: turbinePath
  });

  return gulp
    .src([path.join(turbinePath, 'dist/engine.js')])
    .pipe(gulp.dest('./dist'));
});

gulp.task('watch', function() {
  return gulp.watch(['container.txt'], ['buildContainer']);
});

gulp.task('serve', function() {
  return gulp.src('./').pipe(webserver());
});

gulp.task('default', ['buildEngine', 'buildContainer', 'serve', 'watch']);
