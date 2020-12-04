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
import Split from 'react-split';
import { Flex, View, ActionGroup, Item } from '@adobe/react-spectrum';
import ReactJson from 'react-json-view';
import Spinner from '../components/Spinner';
import ControlTabs from './components/ControlTabs';

import './LibSandboxEdge.css';

const compactResponse = (response) =>
  (response?.body?.traces || [])
    .map((t) =>
      t.messages.reduce((acc, cur) => {
        const lastItem = acc.pop();

        if (typeof cur === 'string' && typeof lastItem === 'string') {
          acc.push(`${lastItem} ${cur}`);
        } else {
          if (lastItem) {
            acc.push(lastItem);
          }
          acc.push(cur);
        }

        return acc;
      }, [])
    )
    .flat();

export default ({ extensionDescriptor }) => {
  const [showSpinner, setShowSpinner] = useState(false);
  const [responseMode, setResponseMode] = React.useState(new Set(['compact']));
  const [response, setResponse] = useState();
  const [splitSizes] = useState(JSON.parse(localStorage.getItem('sandbox/splitSizes')) || [72, 28]);

  const responseToShow = responseMode.has('compact') ? compactResponse(response) : response;

  return (
    <Flex direction="column" height="100%" UNSAFE_style={{ overflow: 'hidden' }}>
      <Flex direction="row" flex UNSAFE_style={{ overflow: 'hidden' }}>
        <Split
          sizes={splitSizes}
          style={{ display: 'flex', width: '100%' }}
          onDragEnd={(sizes) => {
            localStorage.setItem('sandbox/splitSizes', JSON.stringify(sizes));
          }}
        >
          <View
            minWidth="40%"
            backgroundColor="static-white"
            padding="size-75"
            flex
            position="relative"
          >
            {showSpinner ? (
              <Spinner />
            ) : (
              <>
                <View overflow="auto" height="100%">
                  <ReactJson
                    src={responseToShow}
                    collapsed={responseMode.has('compact') ? 2 : false}
                  />
                </View>
                <ActionGroup
                  selectionMode="single"
                  selectedKeys={responseMode}
                  onSelectionChange={setResponseMode}
                  density="compact"
                  position="absolute"
                  right="size-75"
                  top="size-75"
                >
                  <Item key="compact" aria-label="Compact">
                    Compact
                  </Item>
                  <Item key="full" aria-label="Full">
                    Full
                  </Item>
                </ActionGroup>
              </>
            )}
          </View>
          <View id="controlPane" minWidth="size-6000">
            <ControlTabs
              extensionDescriptor={extensionDescriptor}
              onSendRequest={setShowSpinner}
              onRequestResponseReceived={setResponse}
            />
          </View>
        </Split>
      </Flex>
    </Flex>
  );
};
