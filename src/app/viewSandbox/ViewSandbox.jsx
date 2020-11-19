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

import React, { useState, useEffect, useRef } from 'react';
import Split from 'split.js';
import { Flex, View } from '@adobe/react-spectrum';

import { getExtensionDescriptorFromApi } from '../api';
import ViewsSelector from './components/ViewsSelector';
import ControlTabs from './components/ControlTabs';
import getExtensionDescriptorsByValue from './helpers/getExtensionDescriptorsByValue';
import setUpGlobalLoadExtensionView from './helpers/setUpGlobalLoadExtensionView';

import './ViewSandbox.css';
import ErrorMessage from '../components/ErrorMessage';

export default () => {
  const [error, setError] = useState();
  const [state, setState] = useState({
    extensionDescriptor: null,
    extensionViewDescriptorsByValue: null
  });

  const [selectedDescriptor, setSelectedDescriptor] = useState(null);

  const extensionViewPaneRef = useRef();

  useEffect(() => {
    getExtensionDescriptorFromApi()
      .then((extensionDescriptorResult) => {
        setState({
          extensionDescriptor: extensionDescriptorResult,
          extensionViewDescriptorsByValue: getExtensionDescriptorsByValue(extensionDescriptorResult)
        });

        Split(['#extensionViewPane', '#controlPane'], {
          minSize: 0,
          sizes: [72, 28]
        });
      })
      .catch((e) => {
        setError(new Error(e));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  setUpGlobalLoadExtensionView({
    state,
    extensionViewPaneRef
  });

  return error ? (
    <ErrorMessage message={error.message} />
  ) : (
    <Flex direction="column" height="100%" UNSAFE_style={{ overflow: 'hidden' }}>
      <View borderBottomWidth="thin" borderBottomColor="gray-400">
        <ViewsSelector state={state} setSelectedDescriptor={setSelectedDescriptor} />
      </View>
      <Flex direction="row" flex UNSAFE_style={{ overflow: 'hidden' }}>
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
            extensionDescriptor={state.extensionDescriptor}
          />
        </View>
      </Flex>
    </Flex>
  );
};
