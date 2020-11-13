/* eslint-disable no-unused-vars */
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

import React, { useEffect, useState } from 'react';
import { View } from '@adobe/react-spectrum';
import { Controlled as CodeMirror } from 'react-codemirror2';

require('codemirror/mode/javascript/javascript.js');
require('codemirror/lib/codemirror.css');
require('codemirror/theme/material.css');
require('codemirror/theme/neat.css');
require('codemirror/mode/xml/xml.js');
require('codemirror/addon/lint/lint');
require('codemirror/addon/lint/json-lint');
require('codemirror/addon/lint/lint.css');

window.JSHINT = require('jshint').JSHINT;
window.jsonlint = require('jsonlint-mod').parser;

export default ({ onChange, value = '' }) => {
  const [code, setCode] = useState(value);

  useEffect(() => {
    setCode(value);
  }, [value]);

  return (
    <View flexShrink="1" flexGrow="1" height="100%">
      <CodeMirror
        className="codeMirror-Wrapper"
        value={code}
        options={{
          lineNumbers: true,
          mode: 'application/json',
          gutters: ['CodeMirror-lint-markers'],
          lint: true,
          extraKeys: {
            Tab: (cm) => {
              cm.replaceSelection('  ', 'end');
            }
          }
        }}
        onBeforeChange={(_editor, _data, newValue) => {
          setCode(newValue);
        }}
        onChange={(_editor, _data, newValue) => {
          if (onChange) {
            onChange(newValue);
          }
        }}
      />
    </View>
  );
};
