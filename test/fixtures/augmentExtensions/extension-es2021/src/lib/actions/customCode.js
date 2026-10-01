// This delegate module intentionally uses newer ECMAScript syntax (optional chaining,
// nullish coalescing) to verify the require() scanner can parse it.
var logger = require('../helpers/logger');

module.exports = function (settings, event) {
  // Optional chaining + nullish coalescing (ES2020/ES2021).
  var label = event?.detail?.label ?? settings?.label ?? 'unknown';

  // Numeric separator (ES2021) and logical assignment (ES2021).
  var threshold = settings?.threshold;
  threshold ??= 1_000;

  logger.log('custom-code executed for', label, 'threshold', threshold);

  return label;
};
