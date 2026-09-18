// This delegate module intentionally uses newer ECMAScript syntax (optional chaining,
// nullish coalescing) that the legacy babylon@6 parser (pulled in via
// match-requires -> strip-comments@1 -> babel-extract-comments) cannot parse.
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
