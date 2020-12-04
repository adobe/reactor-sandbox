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

import React, { useEffect, useState } from 'react';
import { Tabs } from '@react-spectrum/tabs';
import { Item } from '@adobe/react-spectrum';
import TabContent from './TabContent';
import loadRequest from './helpers/loadRequest';
import { sendEdgeRequest } from '../../api/index';
import transformResponse from './helpers/reccursiveStringParsing';

export default ({ extensionDescriptor, onRequestResponseReceived, onSendRequest }) => {
  const [selectedTab, setSelectedTab] = useState('xdm');
  const [xdm, setXdm] = useState(null);
  const [request, setRequest] = useState(null);

  useEffect(() => {
    loadRequest({ extensionDescriptor, setXdm, setRequest });
  }, [extensionDescriptor]);

  return (
    <Tabs
      selectedKey={selectedTab}
      onSelectionChange={(key) => {
        try {
          if (selectedTab === 'request' && key === 'xdm') {
            const parsedRequest = JSON.parse(request);
            setXdm(JSON.stringify(parsedRequest.body.xdm, null, 2));
          }

          if (selectedTab === 'xdm' && key === 'request') {
            const parsedRequest = JSON.parse(request);
            parsedRequest.body.xdm = JSON.parse(xdm);
            setRequest(JSON.stringify(parsedRequest, null, 2));
          }
          // eslint-disable-next-line no-empty
        } catch (e) {}

        setSelectedTab(key);
      }}
      height="100%"
    >
      <Item title="XDM" key="xdm">
        <TabContent
          content={xdm}
          setContent={setXdm}
          onSend={() => {
            onSendRequest(true);
            sendEdgeRequest(request).then((response) => {
              onRequestResponseReceived(transformResponse(response));
              onSendRequest(false);
            });
          }}
          onReset={() => {
            loadRequest({ extensionDescriptor, setXdm, setRequest });
          }}
        />
      </Item>
      <Item title="Request" key="request">
        <TabContent
          content={request}
          setContent={setRequest}
          onReset={() => {
            loadRequest({ extensionDescriptor, setXdm, setRequest });
          }}
        />
      </Item>
    </Tabs>
  );
};
