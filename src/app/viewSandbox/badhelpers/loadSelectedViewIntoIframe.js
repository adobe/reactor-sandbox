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

import cmDispatchActions from '../components/helpers/cmDispatchActions';

import getDefaultInitInfo from '../components/helpers/getDefaultInitInfo';
import getCachedInitInfo from '../components/helpers/getCachedInitInfo';

export default ({
  selectedViewGroup,
  selectedExtensionViewDescriptor,
  extensionDescriptor,
  cmInitPanelDispatch,
  setValidation,
  setExtensionViewIframeUrl
}) => {
  const defaultInitInfo = getDefaultInitInfo({
    selectedViewGroup,
    selectedExtensionViewDescriptor
  });
  const cachedInitInfo = getCachedInitInfo({
    selectedExtensionViewDescriptor,
    extensionDescriptor
  });

  let initInfo;

  if (cachedInitInfo && !deepEqual(cachedInitInfo, defaultInitInfo)) {
    initInfo = cachedInitInfo;
  } else {
    initInfo = defaultInitInfo;
  }

  cmInitPanelDispatch({
    type: cmDispatchActions.USER_UPDATE_VALUE,
    value: JSON.stringify(initInfo, null, 2)
  });

  setValidation(null);

  let src;
  const viewPath = selectedExtensionViewDescriptor?.viewPath;
  if (viewPath) {
    src =
      `${window.EXPRESS_PUBLIC_URL}/extensionViews/${extensionDescriptor.name}/` +
      `${extensionDescriptor.version}/${viewPath}`;
  } else {
    src = `${window.EXPRESS_PUBLIC_URL}/noConfigIFrame.html`;
  }

  setExtensionViewIframeUrl(src);
};
