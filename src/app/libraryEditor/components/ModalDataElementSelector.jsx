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

import React, { useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ModalDataElementSelector from '../../components/ModalDataElementSelector';
import ExtensionDescriptorContext from '../../extensionDescriptorContext';

const handleOnSave =
  ({ dataElementSelectorModal, closeDataElementSelectorModal }) =>
  (newDataElement) => {
    dataElementSelectorModal.onSave(newDataElement);
    closeDataElementSelectorModal();
  };

const handleOnClose =
  ({ dataElementSelectorModal, closeDataElementSelectorModal }) =>
  () => {
    dataElementSelectorModal.onClose();
    closeDataElementSelectorModal();
  };

export default () => {
  const dataElementSelectorModal = useSelector((state) => state.modals.dataElementSelectorModal);
  const dataElements = useSelector((state) => state.dataElements);
  const { platform } = useContext(ExtensionDescriptorContext);
  const {
    modals: { closeDataElementSelectorModal }
  } = useDispatch();

  if (!dataElementSelectorModal) {
    return null;
  }

  const {
    options: { tokenize }
  } = dataElementSelectorModal;

  return (
    <ModalDataElementSelector
      dataElements={dataElements}
      tokenize={tokenize}
      platform={platform}
      onSave={handleOnSave({
        dataElementSelectorModal,
        closeDataElementSelectorModal
      })}
      onClose={handleOnClose({ dataElementSelectorModal, closeDataElementSelectorModal })}
    />
  );
};
