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

import React, { useState, useRef, useContext } from 'react';
import Split from 'react-split';
import { Flex, View } from '@adobe/react-spectrum';

import ViewsSelector from './components/ViewsSelector';
import ControlTabs from './components/ControlTabs';
import getExtensionDescriptorsByValue from './helpers/getExtensionDescriptorsByValue';
import setUpGlobalLoadExtensionView from './helpers/setUpGlobalLoadExtensionView';
import ExtensionDescriptorContext from '../extensionDescriptorContext';

import './ViewSandbox.css';

export default () => {
  const extensionDescriptor = useContext(ExtensionDescriptorContext);
  const extensionViewDescriptorsByValue = getExtensionDescriptorsByValue(extensionDescriptor);

  const [selectedDescriptor, setSelectedDescriptor] = useState(null);
  const [splitSizes] = useState(JSON.parse(localStorage.getItem('sandbox/splitSizes')) || [72, 28]);

  const extensionViewPaneRef = useRef();

  setUpGlobalLoadExtensionView({
    state: { extensionDescriptor, extensionViewDescriptorsByValue },
    extensionViewPaneRef
  });

  return (
    <Flex direction="column" height="100%" UNSAFE_style={{ overflow: 'hidden' }}>
      <View borderBottomWidth="thin" borderBottomColor="gray-400">
        <ViewsSelector
          state={{ extensionDescriptor, extensionViewDescriptorsByValue }}
          setSelectedDescriptor={setSelectedDescriptor}
        />
      </View>
      <Flex direction="row" flex UNSAFE_style={{ overflow: 'hidden' }}>
        <Split
          sizes={splitSizes}
          style={{ display: 'flex', width: '100%' }}
          onDragEnd={(sizes) => {
            localStorage.setItem('sandbox/splitSizes', JSON.stringify(sizes));
          }}
        >
          <div
            id="extensionViewPane"
            ref={extensionViewPaneRef}
            style={{ background: 'white', flexGrow: 1 }}
          >
            &nbsp;
          </div>
          <View id="controlPane" minWidth="size-6000">
            <ControlTabs
              extensionViewPaneRef={extensionViewPaneRef}
              selectedDescriptor={selectedDescriptor}
              extensionDescriptor={extensionDescriptor}
            />
          </View>
        </Split>
      </Flex>
    </Flex>
  );
};
