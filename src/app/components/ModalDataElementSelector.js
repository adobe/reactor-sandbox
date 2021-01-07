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

import React, { useState, useMemo } from 'react';

import {
  Dialog,
  DialogContainer,
  Heading,
  Content,
  ButtonGroup,
  Button,
  Picker,
  Divider,
  Item
} from '@adobe/react-spectrum';

const handleOnSave = ({ dataElement, tokenize, platform, onSave }) => {
  let newDataElement = '';

  if (dataElement) {
    if (!tokenize) {
      newDataElement = dataElement;
    } else if (platform === 'edge') {
      newDataElement = `{{${dataElement}}}`;
    } else {
      newDataElement = `%${dataElement}%`;
    }
  }

  onSave(newDataElement);
};

export default ({ dataElements, platform, tokenize, onClose, onSave }) => {
  const [dataElement, setDataElement] = useState('');
  const dataElementList = useMemo(
    () =>
      dataElements.map(({ name }) => ({
        id: name,
        name
      })),
    [dataElements]
  );

  return (
    <DialogContainer>
      <Dialog>
        <Heading>Datas Element Selector</Heading>
        <Divider />
        <Content>
          <Picker
            marginTop="size-150"
            label="Data Element"
            selectedKey={dataElement}
            onSelectionChange={setDataElement}
            width="100%"
            items={dataElementList}
          >
            {(item) => <Item>{item.name}</Item>}
          </Picker>
        </Content>
        <ButtonGroup>
          <Button variant="secondary" onPress={onClose}>
            Cancel
          </Button>
          <Button
            variant="cta"
            onPress={() => {
              handleOnSave({
                dataElement,
                onSave,
                platform,
                tokenize
              });
            }}
          >
            Save
          </Button>
        </ButtonGroup>
      </Dialog>
    </DialogContainer>
  );
};
