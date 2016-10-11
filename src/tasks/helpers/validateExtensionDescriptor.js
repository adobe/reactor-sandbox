'use strict';

var Ajv = require('ajv');
var extensionDescriptorSchema = require('@reactor/turbine-schemas/extension-package.json');

module.exports = function(extensionDescriptor) {
  var ajv = new Ajv();

  var isValid = ajv.validate(extensionDescriptorSchema, extensionDescriptor);

  if (!isValid) {
    console.error('An error was found in your extension.json: ' + ajv.errorsText());
  }

  return isValid;
};
