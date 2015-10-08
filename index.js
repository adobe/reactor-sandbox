'use strict';

module.exports = function(gulp) {
  require('turbine')(gulp);
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
