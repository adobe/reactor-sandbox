/* eslint-disable jsx-a11y/control-has-associated-label */

import React from 'react';
import { connect } from 'react-redux';
import { withRouter, useHistory } from 'react-router-dom';
import { Heading, ActionGroup, Item, Flex, TooltipTrigger, Tooltip } from '@adobe/react-spectrum';
import Edit from '@spectrum-icons/workflow/Edit';
import Delete from '@spectrum-icons/workflow/Delete';
import basePath from '../helpers/basePath';

const cardDetails = (item, type, registry) => {
  const component = registry.getIn(['components', type, item.get('modulePath')]);
  return (
    <>
      <Heading level={4} margin="0" marginBottom="size-150">
        {component.get('displayName')}
      </Heading>
      <Heading level={5} margin="0" marginBottom="size-400">
        {component.get('extensionDisplayName')}
      </Heading>
    </>
  );
};

const RuleComponentCard = ({ item, match, type, index, registry, handleDeleteClick }) => {
  const history = useHistory();

  return (
    <Flex direction="column" alignItems="center">
      {cardDetails(item, type, registry)}

      <ActionGroup
        onAction={(key) => {
          if (key === '.$edit') {
            history.push(`${basePath}/rules/${match.params.rule_id}/${type}/${index}`);
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

const mapState = (state) => {
  return {
    registry: state.registry
  };
};

const mapDispatch = () => ({});

export default withRouter(connect(mapState, mapDispatch)(RuleComponentCard));
