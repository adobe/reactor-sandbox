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
