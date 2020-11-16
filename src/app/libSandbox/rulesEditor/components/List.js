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

import React from 'react';
import { useRouteMatch, useHistory } from 'react-router-dom';
import {
  Button,
  Text,
  ActionGroup,
  Item,
  Flex,
  View,
  Heading,
  Divider
} from '@adobe/react-spectrum';
import { Cell, Column, Row, Table, TableBody, TableHeader } from '@react-spectrum/table';
import Add from '@spectrum-icons/workflow/Add';
import Edit from '@spectrum-icons/workflow/Edit';
import Delete from '@spectrum-icons/workflow/Delete';

const List = ({ items, nameProperty, deleteFn, heading = 'Unknows' }) => {
  const { url } = useRouteMatch();
  const history = useHistory();

  return (
    <Flex direction="column" width="50rem" margin="0 auto">
      <Heading size="3">{heading}</Heading>
      <Divider />
      <Table aria-label="table" overflowMode="wrap" marginTop="size-200">
        <TableHeader>
          <Column key="name">Name</Column>
          <Column key="actions" width="24%">
            Actions
          </Column>
        </TableHeader>
        <TableBody>
          {items.map((item, i) => (
            <Row key={item}>
              <Cell className="list-item-name">{item.get(nameProperty)}</Cell>
              <Cell className="list-item-actions">
                <ActionGroup
                  onAction={(key) =>
                    key === 'delete'
                      ? deleteFn(i)
                      : history.push(`${url}${url.endsWith('/') ? '' : '/'}${i}`)
                  }
                >
                  <Item key="edit" textValue="edit">
                    <Edit />
                    <Text>Edit</Text>
                  </Item>
                  <Item key="delete" textValue="delete">
                    <Delete />
                    <Text>Delete</Text>
                  </Item>
                </ActionGroup>
              </Cell>
            </Row>
          ))}
          {items.size === 0 ? (
            <Row>
              <Cell>No items found.</Cell>
              <Cell>&nbsp;</Cell>
            </Row>
          ) : null}
        </TableBody>
      </Table>

      <View>
        <Button
          variant="cta"
          marginTop="size-150"
          onPress={() => history.push(`${url}${url.endsWith('/') ? '' : '/'}new`)}
        >
          <Add />
          <Text>Add</Text>
        </Button>
      </View>
    </Flex>
  );
};

export default List;
