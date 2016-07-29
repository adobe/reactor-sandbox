#!/usr/bin/env node

'use strict';

var task = process.argv.slice(2)[0];

switch (task) {
  case 'build':
    require('./build')();
    break;
  case 'init':
    require('./init')();
    break;
  default:
    require('./run')();
    break;
}
