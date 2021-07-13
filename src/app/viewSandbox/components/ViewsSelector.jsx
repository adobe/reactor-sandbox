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
import { Flex, Picker, Item, Section } from '@adobe/react-spectrum';

import buildViewTypeOptions from './helpers/buildViewTypeOptions';
import buildViewOptions from './helpers/buildViewOptions';
import detectViewTypeAndViewValues from './helpers/detectViewTypeAndViewValues';
import updateSelectedDescriptor from './helpers/updateSelectedDescriptor';
import VIEW_GROUPS from '../helpers/viewsGroups';

const saveLastSelectedViewType = (platform, extensionName, viewType) =>
  localStorage.setItem(`lastSelectedViewType/${platform}/${extensionName}`, viewType);

const saveLastSelectedView = (platform, extensionName, view) =>
  localStorage.setItem(`lastSelectedView/${platform}/${extensionName}`, view);

export default ({
  state: { extensionDescriptor, extensionViewDescriptorsByValue },
  setSelectedDescriptor
}) => {
  const [selectedViewType, setSelectedViewType] = useState('');
  const [selectedView, setSelectedView] = useState('');

  useEffect(() => {
    detectViewTypeAndViewValues({
      extensionDescriptor,
      extensionViewDescriptorsByValue,
      selectedViewType,
      setSelectedViewType,
      selectedView,
      setSelectedView
    });

    updateSelectedDescriptor({
      setSelectedDescriptor,
      selectedViewType,
      selectedView,
      extensionViewDescriptorsByValue
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extensionDescriptor, selectedViewType, selectedView]);

  return (
    <Flex
      direction="row"
      gap="size-150"
      marginStart="size-150"
      marginTop="size-100"
      marginBottom="size-100"
    >
      <Picker
        label="View Type"
        selectedKey={selectedViewType}
        items={buildViewTypeOptions(extensionDescriptor)}
        onSelectionChange={(k) => {
          setSelectedViewType(k);
          saveLastSelectedViewType(extensionDescriptor?.platform, extensionDescriptor?.name, k);

          // We reset the view data, so that the first view of the
          // current type will be selected from the list.
          setSelectedView('');
          saveLastSelectedView(extensionDescriptor?.platform, extensionDescriptor?.name, '');
        }}
      >
        {(item) => <Item>{item.name}</Item>}
      </Picker>

      {VIEW_GROUPS.CONFIGURATION !== selectedViewType && (
        <Picker
          label="View"
          selectedKey={selectedView}
          items={buildViewOptions(extensionDescriptor, selectedViewType)}
          onSelectionChange={(k) => {
            setSelectedView(k);
            saveLastSelectedView(extensionDescriptor?.platform, extensionDescriptor?.name, k);
          }}
        >
          {(item) =>
            item.children ? (
              <Section key={item.name} items={item.children} title={item.name}>
                {(subItem) => <Item>{subItem.name}</Item>}
              </Section>
            ) : (
              <Item>{item.name}</Item>
            )
          }
        </Picker>
      )}
    </Flex>
  );
};
