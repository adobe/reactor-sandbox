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

import React, { useContext, useState } from 'react';

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
import { useDispatch, useSelector } from 'react-redux';
import ExtensionDescriptorContext from '../../extensionDescriptorContext';

const handleOnSave = ({
  dataElement,
  dataElementSelectorModal,
  setDataElement,
  platform,
  closeDataElementSelectorModal
}) => {
  let newDataElement = '';
  const {
    options: { tokenize }
  } = dataElementSelectorModal;

  if (dataElement) {
    if (!tokenize) {
      newDataElement = dataElement;
    } else if (platform === 'edge') {
      newDataElement = `{{${dataElement}}}`;
    } else {
      newDataElement = `%${dataElement}%`;
    }
  }

  dataElementSelectorModal.onSave(newDataElement);
  setDataElement('');
  closeDataElementSelectorModal();
};

const handleOnClose = ({
  dataElementSelectorModal,
  setDataElement,
  closeDataElementSelectorModal
}) => {
  dataElementSelectorModal.onClose();
  setDataElement('');
  closeDataElementSelectorModal();
};

const dataElementList = ({ dataElements }) =>
  Object.values(dataElements).map((v) => ({
    id: v.name,
    name: v.name
  }));

export default () => {
  const dispatch = useDispatch();
  const dataElements = useSelector((state) => state.dataElements);
  const dataElementSelectorModal = useSelector((state) => state.modals.dataElementSelectorModal);
  const [dataElement, setDataElement] = useState('');
  const extensionDescriptorContext = useContext(ExtensionDescriptorContext);

  return dataElementSelectorModal && dataElementSelectorModal.open ? (
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
            items={dataElementList({ dataElements })}
          >
            {(item) => <Item>{item.name}</Item>}
          </Picker>
        </Content>
        <ButtonGroup>
          <Button
            variant="secondary"
            onPress={() => {
              handleOnClose({
                dataElementSelectorModal,
                setDataElement,
                closeDataElementSelectorModal: dispatch.modals.closeDataElementSelectorModal
              });
            }}
          >
            Cancel
          </Button>
          <Button
            variant="cta"
            onPress={() => {
              handleOnSave({
                dataElementSelectorModal,
                dataElement,
                setDataElement,
                platform: extensionDescriptorContext.platform,
                closeDataElementSelectorModal: dispatch.modals.closeDataElementSelectorModal
              });
            }}
          >
            Save
          </Button>
        </ButtonGroup>
      </Dialog>
    </DialogContainer>
  ) : null;
};
