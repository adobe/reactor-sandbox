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

import deepEqual from 'deep-equal';
import logMessage from './logMessage';
import reportIframeComError from './reportIframeComError';
import getDefaultInitInfo from './getDefaultInitInfo';
import setCachedInitInfo from './setCachedInitInfo';

/**
 * Grabs the current value of the init panel and sends it to the init function of the extension.
 */
export default ({
  cmInitPanelState,
  setValidation,
  extensionView,
  extensionDescriptor,
  selectedViewGroup,
  selectedExtensionViewDescriptor
}) => {
  const initInfo = JSON.parse(cmInitPanelState.value || '{}');
  const defaultInfo = getDefaultInitInfo({ selectedViewGroup, selectedExtensionViewDescriptor });

  if (!deepEqual(initInfo, defaultInfo)) {
    setCachedInitInfo({ initInfo, selectedExtensionViewDescriptor, extensionDescriptor });
  }

  logMessage('init() with', cmInitPanelState.value);

  extensionView
    .init(initInfo)
    .then(() => setValidation(null))
    .catch(reportIframeComError);
};
