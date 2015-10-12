'use strict';

module.exports = function(gulp) {
  var turbine;
  var projectPackage = require(path.join(process.cwd(), 'package.json'));

  // If we're running gulp from the turbine repo, use its code to build the engine. If not, use
  // the builder's turbine dependency instead.
  if (projectPackage.name === 'turbine') {
    turbine = require(path.join(process.cwd(), 'index.js'));
  } else {
    turbine = require('turbine');
  }

  turbine(gulp);

  require('./tasks/buildContainer')(gulp);
  require('./tasks/copyEngine')(gulp);
  require('./tasks/copyHTMLToOutput')(gulp);
  require('./tasks/copyTemplates')(gulp);
  require('./tasks/serve')(gulp);
  require('./tasks/watch')(gulp);

  gulp.task('default', [
    'copyTemplates',
    'copyHTMLToOutput',
    'buildEngine',
    'copyEngine',
    'buildContainer',
    'serve',
    'watch'
  ]);
};
