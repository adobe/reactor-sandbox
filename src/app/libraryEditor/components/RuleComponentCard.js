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

/* eslint-disable jsx-a11y/control-has-associated-label */

import React from 'react';
import { useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import {
  Heading,
  ActionGroup,
  Item,
  Flex,
  TooltipTrigger,
  Tooltip,
  View
} from '@adobe/react-spectrum';
import Edit from '@spectrum-icons/workflow/Edit';
import Delete from '@spectrum-icons/workflow/Delete';
import NAMED_ROUTES from '../../constants';

const cardDetails = (item, type, registry) => {
  const component = registry.components[type][item.modulePath];
  return (
    <View flex>
      <Heading level={4} margin="0" marginBottom="size-150" UNSAFE_style={{ textAlign: 'center' }}>
        {component.displayName}
      </Heading>
      <Heading level={5} margin="0" marginBottom="size-400" UNSAFE_style={{ textAlign: 'center' }}>
        {component.extensionDisplayName}
      </Heading>
    </View>
  );
};

export default ({ item, type, index, handleDeleteClick }) => {
  const history = useHistory();
  const { rule_id: ruleId } = useParams();
  const registry = useSelector((state) => state.registry);
  const basePath = NAMED_ROUTES.LIBRARY_EDITOR;

  return (
    <Flex direction="column" alignItems="center" height="100%">
      {cardDetails(item, type, registry)}

      <ActionGroup
        onAction={(key) => {
          if (key === '.$edit') {
            history.push(`${basePath}/rules/${ruleId}/${type}/${index}`);
          } else {
            handleDeleteClick(type, index);
          }
        }}
      >
        <TooltipTrigger>
          <Item key="edit" textValue="edit">
            <Edit />
          </Item>
          <Tooltip>Edit Component</Tooltip>
        </TooltipTrigger>
        <TooltipTrigger>
          <Item key="delete" textValue="delete">
            <Delete />
          </Item>
          <Tooltip>Delete Component</Tooltip>
        </TooltipTrigger>
      </ActionGroup>
    </Flex>
  );
};
