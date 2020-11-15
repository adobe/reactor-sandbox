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

import defaultOpenCodeEditor from '../extensionBridgeComponents/openCodeEditor';
import defaultOpenRegexTester from '../extensionBridgeComponents/openRegexTester';
import defaultOpenDataElementSelector from '../extensionBridgeComponents/openDataElementSelector';
import getNewBridge from './getNewBridge';

export default ({
  state: { extensionViewDescriptorsByValue, extensionDescriptor },
  extensionViewPaneRef
}) => {
  window.loadExtensionView = ({
    viewPath,
    initInfo,
    openCodeEditor = defaultOpenCodeEditor,
    openRegexTester = defaultOpenRegexTester,
    openDataElementSelector
  }) => {
    const selectedDescriptorKey = Object.keys(extensionViewDescriptorsByValue).filter(
      (k) => extensionViewDescriptorsByValue[k].viewPath === viewPath
    )[0];

    if (selectedDescriptorKey) {
      const type = selectedDescriptorKey.split('/')[0];
      const descriptor = extensionViewDescriptorsByValue[selectedDescriptorKey];

      return getNewBridge({
        parentContainerRef: extensionViewPaneRef,
        extensionDescriptor,
        selectedDescriptor: { type, descriptor },
        initInfo,
        openCodeEditor,
        openRegexTester,
        openDataElementSelector: openDataElementSelector
          ? () => (options = {}) => openDataElementSelector(options)
          : defaultOpenDataElementSelector
      }).promise;
    }

    return Promise.reject(new Error('Not a valid view provided'));
  };
};
