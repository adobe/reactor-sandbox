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

import cmDispatchActions from './cmDispatchActions';

/**
 * Forces the contents of the settings panel into the init panel's settings object.
 */
export default ({ cmInitPanelState, cmSettingsPanelState, cmInitPanelDispatch, setValidation }) => {
  const initContent = JSON.parse(cmInitPanelState.value);
  initContent.settings = JSON.parse(cmSettingsPanelState.value || '{}');

  cmInitPanelDispatch({
    type: cmDispatchActions.SYNC_VALUE_AND_PERSISTENT_VALUE,
    value: JSON.stringify(initContent, null, 2)
  });

  setValidation(null);
};
