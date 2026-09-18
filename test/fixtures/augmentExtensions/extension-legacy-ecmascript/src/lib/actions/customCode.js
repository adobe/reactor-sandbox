// This delegate module is the control: it implements the same logic as the ES2021 fixture
// but uses only ES2017-era syntax, which even the legacy babylon@6 parser can handle.
var logger = require('../helpers/logger');

module.exports = function (settings, event) {
  var detail = event && event.detail;
  var label = (detail && detail.label) || (settings && settings.label) || 'unknown';

  var threshold = settings && settings.threshold;
  if (threshold === undefined || threshold === null) {
    threshold = 1000;
  }

  logger.log('custom-code executed for', label, 'threshold', threshold);

  return label;
};
