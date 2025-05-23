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
  Divider,
  Cell,
  Column,
  Row,
  TableView,
  TableBody,
  TableHeader
} from '@adobe/react-spectrum';

import Add from '@spectrum-icons/workflow/Add';
import Edit from '@spectrum-icons/workflow/Edit';
import Delete from '@spectrum-icons/workflow/Delete';

const List = ({ items, nameProperty, keyName, deleteFn, heading = 'Unknows' }) => {
  const { url } = useRouteMatch();
  const history = useHistory();
  return (
    <View padding="size-200" flex>
      <Flex direction="column" maxWidth="50rem" margin="2rem auto">
        <Heading level="2">{heading}</Heading>
        <Divider />
        <TableView aria-label="table" overflowMode="wrap" marginTop="size-200">
          <TableHeader>
            <Column key="name">Name</Column>
            <Column key="actions" align="end" width="30%">
              <View paddingRight="size-1000">Actions</View>
            </Column>
          </TableHeader>
          <TableBody>
            {items.map((item, i) => (
              <Row key={item[keyName]}>
                <Cell>{item[nameProperty]}</Cell>
                <Cell>
                  <Flex direction="column" alignItems="end">
                    <ActionGroup
                      width="auto"
                      onAction={(key) =>
                        key === 'delete'
                          ? deleteFn(i)
                          : history.push(`${url}${url.endsWith('/') ? '' : '/'}${i}`)
                      }
                    >
                      <Item key="edit" textValue="edit">
                        <Edit marginStart="size-200" />
                        <Text>Edit</Text>
                      </Item>
                      <Item key="delete" textValue="delete">
                        <Delete marginStart="size-200" />
                        <Text>Delete</Text>
                      </Item>
                    </ActionGroup>
                  </Flex>
                </Cell>
              </Row>
            ))}

            {items.length === 0 ? (
              <Row>
                <Cell>No items found.</Cell>
                <Cell>&nbsp;</Cell>
              </Row>
            ) : null}
          </TableBody>
        </TableView>

        <View>
          <Button
            variant="cta"
            marginTop="size-150"
            onPress={() => history.push(`${url}${url.endsWith('/') ? '' : '/'}new`)}
          >
            <Add marginEnd="size-50" />
            <Text>Add</Text>
          </Button>
        </View>
      </Flex>
    </View>
  );
};

export default List;
