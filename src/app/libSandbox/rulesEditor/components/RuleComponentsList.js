/* eslint-disable react/jsx-no-bind */

import React from 'react';
import { withRouter } from 'react-router-dom';
import { Flex, View, ActionButton, Text } from '@adobe/react-spectrum';
import Add from '@spectrum-icons/workflow/Add';
import RuleComponentCard from './RuleComponentCard';
import basePath from '../helpers/basePath';

const handleOnClick = (type, match, history) => {
  history.push(`${basePath}/rules/${match.params.rule_id}/${type}/new`);
};

const RuleComponentsList = ({
  items,
  type,
  match,
  history,
  handleDeleteClick,
  addLabel = 'Add'
}) => (
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

export default withRouter(RuleComponentsList);
