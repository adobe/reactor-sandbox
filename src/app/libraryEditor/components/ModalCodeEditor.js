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
import { useDispatch, useSelector } from 'react-redux';

import ModalCodeEditor from '../../components/ModalCodeEditor';

const handleOnSave =
  ({ codeEditorModal, closeCodeEditorModal }) =>
  (newContent) => {
    codeEditorModal.onSave(newContent);
    closeCodeEditorModal();
  };

const handleOnClose =
  ({ codeEditorModal, closeCodeEditorModal }) =>
  () => {
    codeEditorModal.onClose();
    closeCodeEditorModal();
  };

export default () => {
  const codeEditorModal = useSelector((state) => state.modals.codeEditorModal);
  const {
    modals: { closeCodeEditorModal }
  } = useDispatch();

  if (!codeEditorModal) {
    return null;
  }

  return (
    <ModalCodeEditor
      options={codeEditorModal.options}
      code={codeEditorModal.code}
      onSave={handleOnSave({ codeEditorModal, closeCodeEditorModal })}
      onClose={handleOnClose({ codeEditorModal, closeCodeEditorModal })}
    />
  );
};
