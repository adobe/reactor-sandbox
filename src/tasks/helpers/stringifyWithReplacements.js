/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const Replacement = require('./Replacement');

const FUNCTION_TOKEN_REGEX = /"\{\{sandbox:function:(.+?)\}\}"/g;

const createReplacer = (replacements) => {
  let tokenId = 0;

  return (key, value) => {
    if (value instanceof Replacement || typeof value === 'function') {
      tokenId += 1;
      replacements[tokenId] = value.toString();
      return `{{sandbox:function:${tokenId}}}`;
    }
    return value;
  };
};

module.exports = (obj) => {
  const replacements = {};
  const json = JSON.stringify(obj, createReplacer(replacements));
  return json.replace(FUNCTION_TOKEN_REGEX, (match, tokenId) => {
    return replacements[tokenId];
  });
};
