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
import getDefaultInitInfo from './getDefaultInitInfo';

export default ({ cmInitPanelState, selectedViewGroup, selectedExtensionViewDescriptor }) => {
  let canReset;

  const defaultInfo = getDefaultInitInfo({ selectedViewGroup, selectedExtensionViewDescriptor });

  try {
    // if the contents of the initPanel are ever not the same as the defaultInfo, we can reset
    canReset = !deepEqual(JSON.parse(cmInitPanelState.value), defaultInfo);
  } catch (e) {
    // there was an error, assume it's a parse error and we can reset
    canReset = true;
  }

  return canReset;
};
