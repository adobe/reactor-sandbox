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

/* eslint-disable react/jsx-no-bind */

import React from 'react';
import { Flex, View, ActionButton, Text } from '@adobe/react-spectrum';
import Add from '@spectrum-icons/workflow/Add';
import RuleComponentCard from './RuleComponentCard';
import NAMED_ROUTES from '../../constants';

const handleOnClick = (type, match, history) => {
  history.push(`${NAMED_ROUTES.LIBRARY_EDITOR}/rules/${match.params.rule_id}/${type}/new`);
};

export default ({ items, type, match, history, handleDeleteClick, addLabel = 'Add' }) => (
  <>
    <Flex direction="row" gap="size-300" wrap>
      {items.map((item, i) => (
        <View
          key={item}
          width="size-2400"
          borderWidth="thin"
          borderColor="dark"
          borderRadius="medium"
          padding="size-250"
        >
          <RuleComponentCard
            key={item}
            item={item}
            type={type}
            index={i}
            handleDeleteClick={handleDeleteClick}
          />
        </View>
      ))}
    </Flex>
    <ActionButton onPress={handleOnClick.bind(this, type, match, history)} marginTop="size-150">
      <Add />
      <Text>{addLabel}</Text>
    </ActionButton>
  </>
);
