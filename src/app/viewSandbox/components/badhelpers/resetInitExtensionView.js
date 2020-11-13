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

import logMessage from './logMessage';
import reportIframeComError from './reportIframeComError';
import getDefaultInitInfo from './getDefaultInitInfo';
import setCachedInitInfo from './setCachedInitInfo';
import cmDispatchActions from './cmDispatchActions';

/**
 * Resets the init panel back to the default info.
 */
export default (
  cmInitPanelDispatch,
  setValidation,
  extensionView,
  extensionDescriptor,
  selectedViewGroup,
  selectedExtensionViewDescriptor
) => {
  const defaultInfo = getDefaultInitInfo({ selectedViewGroup, selectedExtensionViewDescriptor });

  setCachedInitInfo({ initInfo: null, selectedExtensionViewDescriptor, extensionDescriptor });

  cmInitPanelDispatch({
    type: cmDispatchActions.USER_UPDATE_VALUE,
    value: JSON.stringify(defaultInfo, null, 2)
  });

  logMessage('init() with', defaultInfo);
  extensionView
    .init(defaultInfo)
    .then(() => setValidation(null))
    .catch(reportIframeComError);
};
