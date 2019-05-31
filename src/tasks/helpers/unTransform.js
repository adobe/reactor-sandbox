const beautify = require('js-beautify').js_beautify;
const files = require('../constants/files');
const fs = require('fs');
const readFileContent = fileName => {
  let code = fs
    .readFileSync(`${files.CONSUMER_PROVIDED_FILES_PATH}/files/${fileName}`)
    .toString('utf8');

  const customCodeMatch = code.match(
    /_satellite.__registerScript\(\"\/files\/file[0-9]+\.js\", \"(.*)\"/
  );

  if (customCodeMatch) {
    code = customCodeMatch[1];
  }

  return beautify(code);
};

module.exports = (k, v) => {
  if (typeof v === 'function') {
    const fn = v.toString();
    const fnMatch = /function\s*\(.*\)\s*\{([^]+)\}/gim.exec(fn);
    /* eslint-disable-next-line camelcase */
    return (fnMatch && fnMatch[1] && beautify(fnMatch[1], { indent_size: 2 })) || fn;
  }

  if (k === 'isExternal') {
    return;
  }

  if (typeof v === 'string') {
    const customMatch = v.match(/files\/(file[0-9]+\.js)/);
    if (customMatch) {
      return readFileContent(customMatch[1]);
    }
  }

  return v;
};
