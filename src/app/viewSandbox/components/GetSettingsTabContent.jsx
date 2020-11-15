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

import React, { useState } from 'react';
import { ButtonGroup, Button } from '@adobe/react-spectrum';
import CodeMirrorEditor from './CodeMirrorEditor';
import reportFatalError from './helpers/reportFatalError';
import { LOG_PREFIX } from './helpers/constants';

const onGetSettingsPress = ({ setSettings, extensionBridge }) => {
  if (extensionBridge) {
    extensionBridge.promise.then((api) => {
      api
        .getSettings()
        .then((settings) => {
          // eslint-disable-next-line no-console
          console.log(`${LOG_PREFIX} getSettings() returned`, settings);
          setSettings(JSON.stringify(settings, null, 2));
        })
        .catch(reportFatalError);
    });
  }
};

export default ({ extensionBridge, onCopySettingsPress }) => {
  const [settings, setSettings] = useState('null');

  return (
    <>
      <CodeMirrorEditor value={settings} onChange={setSettings} />

      <ButtonGroup margin="size-150" position="absolute" bottom="size-0">
        <Button
          variant="cta"
          onPress={() =>
            onGetSettingsPress({
              setSettings,
              extensionBridge
            })
          }
        >
          Get Settings
        </Button>
        <Button
          variant="secondary"
          onPress={() => {
            onCopySettingsPress(settings);
          }}
        >
          Copy Settings to Init Panel
        </Button>
      </ButtonGroup>
    </>
  );
};
