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

import React, { useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Flex, View, ActionGroup, Item, Text } from '@adobe/react-spectrum';
import DataElementsIcon from '@spectrum-icons/workflow/Variable';
import RuleIcon from '@spectrum-icons/workflow/PageRule';
import ExtenionConfigurationIcon from '@spectrum-icons/workflow/Box';
import PropertySettingsIcon from '@spectrum-icons/workflow/Properties';
import SettingsIcon from '@spectrum-icons/workflow/Settings';

import { NAMED_ROUTES } from '../../constants';

import './Menu.css';

export default () => {
  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
  const history = useHistory();
  const location = useLocation();

  useEffect(() => {
    ['extension_configurations', 'data_elements', 'rules', 'property_settings', 'settings'].forEach(
      (k) => {
        if (location.pathname.includes(`${NAMED_ROUTES.LIBRARY_EDITOR}/${k}`)) {
          setSelectedKeys(new Set([`${NAMED_ROUTES.LIBRARY_EDITOR}/${k}`]));
        }
      }
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Flex direction="column" height="100%" width="size-3200">
      <View borderEndWidth="thin" borderEndColor="gray-400" height="100%" padding="size-200">
        <ActionGroup
          isQuiet
          orientation="vertical"
          selectionMode="single"
          selectedKeys={selectedKeys}
          UNSAFE_className="LeftMenu"
          onSelectionChange={(key) => {
            const path = [...key][0];
            if (path) {
              setSelectedKeys(new Set([path]));
              history.push(path);
            }
          }}
        >
          <Item
            key={`${NAMED_ROUTES.LIBRARY_EDITOR}/extension_configurations`}
            textValue="Extension Configuration"
          >
            <ExtenionConfigurationIcon marginStart="size-100" marginEnd="size-50" />
            <Text>Extension Configurations</Text>
          </Item>
          <Item key={`${NAMED_ROUTES.LIBRARY_EDITOR}/data_elements`} textValue="Data Elements">
            <DataElementsIcon marginStart="size-100" marginEnd="size-50" />
            <Text>Data Elements</Text>
          </Item>
          <Item key={`${NAMED_ROUTES.LIBRARY_EDITOR}/rules`} textValue="Rules">
            <RuleIcon marginStart="size-100" marginEnd="size-50" />
            <Text>Rules</Text>
          </Item>
          <Item
            key={`${NAMED_ROUTES.LIBRARY_EDITOR}/property_settings`}
            textValue="Property Settings"
          >
            <PropertySettingsIcon marginStart="size-100" marginEnd="size-50" />
            <Text>Property Settings</Text>
          </Item>
          <Item key={`${NAMED_ROUTES.LIBRARY_EDITOR}/settings`} textValue="Settings">
            <SettingsIcon marginStart="size-100" marginEnd="size-50" />
            <Text>Settings</Text>
          </Item>
        </ActionGroup>
      </View>
    </Flex>
  );
};
