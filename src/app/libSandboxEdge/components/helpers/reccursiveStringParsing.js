/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

/* eslint-disable no-use-before-define */

const parseString = (str) => {
  try {
    const parsedString = JSON.parse(str);
    return parse(parsedString);
    // eslint-disable-next-line no-empty
  } catch {}

  return str;
};

const parseObject = (obj) => {
  const ret = {};
  const keys = Object.keys(obj);
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    const value = obj[key];
    ret[key] = parse(value);
  }
  return ret;
};

const parseArray = (arr) => {
  const ret = [];

  for (let i = 0, len = arr.length; i < len; i += 1) {
    ret.push(parse(arr[i]));
  }

  return ret;
};

const parse = (thing) => {
  if (typeof thing === 'string') {
    return parseString(thing);
  }

  if (Array.isArray(thing)) {
    return parseArray(thing);
  }

  if (typeof thing === 'object' && thing !== null) {
    return parseObject(thing);
  }

  return thing;
};

export default parse;
