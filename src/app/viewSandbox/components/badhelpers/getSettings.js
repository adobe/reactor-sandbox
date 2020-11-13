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

import { SETTINGS_LABEL_ASYNC, SETTINGS_LABEL_DEFAULT } from '../../helpers/constants';
import logMessage from './logMessage';
import cmDispatchActions from './cmDispatchActions';
import reportIframeComError from './reportIframeComError';

export default async (
  setIsGettingSettings,
  setSettingsButtonLabel,
  cmSettingsPanelDispatch,
  extensionView
) => {
  setIsGettingSettings(true);

  const timeoutId = setTimeout(() => {
    // only report if it takes longer than half a second to retrieve
    setSettingsButtonLabel(SETTINGS_LABEL_ASYNC);
  }, 50);

  // reporting the validation during getSettings will help inform developers of their problems
  // await reportValidation();

  extensionView
    .getSettings()
    .then((settings) => {
      clearTimeout(timeoutId);
      setSettingsButtonLabel(SETTINGS_LABEL_DEFAULT);
      logMessage('getSettings() returned', settings);
      cmSettingsPanelDispatch({
        type: cmDispatchActions.USER_UPDATE_VALUE,
        value: JSON.stringify(settings, null, 2)
      });
    })
    .catch((error) => {
      logMessage('getSettings() errored', error);
      return reportIframeComError(error);
    })
    .finally(() => {
      setIsGettingSettings(false);
    });
};
