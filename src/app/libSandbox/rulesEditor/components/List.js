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
import { Button, Text, ActionGroup, Item } from '@adobe/react-spectrum';
import Add from '@spectrum-icons/workflow/Add';
import Edit from '@spectrum-icons/workflow/Edit';
import Delete from '@spectrum-icons/workflow/Delete';
import './List.css';

const List = ({ items, nameProperty, deleteFn, className }) => {
  const { url } = useRouteMatch();
  const history = useHistory();

  return (
    <div className={`list-container ${className}`}>
      <table className="pure-table list-table">
        <thead>
          <tr>
            <th>Name</th>
            <th className="list-item-actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={item}>
              <td className="list-item-name">{item.get(nameProperty)}</td>
              <td className="list-item-actions">
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
              </td>
            </tr>
          ))}
          {items.size === 0 ? (
            <tr>
              <td colSpan="2">No items found.</td>
            </tr>
          ) : null}
        </tbody>
      </table>

      <Button
        variant="cta"
        marginTop="size-150"
        onPress={() => history.push(`${url}${url.endsWith('/') ? '' : '/'}new`)}
      >
        <Add />
        <Text>Add</Text>
      </Button>
    </div>
  );
};

export default List;
