'use strict';

var path = require('path');
var glob = require('glob');

/**
 * @param {Object} gulp The gulp object to which tasks should be added.
 * @param {Object} [options] Task options.
 * @param {String} [options.buildViewTask] The name of the task that should be run to build the
 * extension's views. This is optional and should be provided when the extension needs to do some
 * processing before the views may be consumed. For example, the task might compile React JSX files
 * using Webpack.
 */
module.exports = function(gulp, options) {
  options = options || {};

  var windgoggles = require('turbine-windgoggles/tasks/index');
  windgoggles(gulp);

  // Require in each task.
  glob.sync(path.join(__dirname, 'tasks/*.js')).forEach(function(taskFile) {
    require(taskFile)(gulp, options);
  });

  gulp.task('sandbox', ['sandbox:sandbox']);
};
