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

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  Dialog,
  DialogContainer,
  Heading,
  Content,
  ButtonGroup,
  Button,
  TextArea,
  Divider
} from '@adobe/react-spectrum';

import './ModalCodeEditor.css';

const handleOnSave = ({ codeEditorModal, codeEditorModalContent, closeCodeEditorModal }) => {
  codeEditorModal.get('onSave')(codeEditorModalContent);
  closeCodeEditorModal();
};

const handleOnClose = ({ codeEditorModal, closeCodeEditorModal }) => {
  codeEditorModal.get('onClose')();
  closeCodeEditorModal();
};

export default () => {
  const dispatch = useDispatch();
  const codeEditorModal = useSelector((state) => state.modals.getIn(['codeEditorModal']));
  const [codeEditorModalContent, setCodeEditorModalContent] = useState('');

  useEffect(() => {
    if (codeEditorModal) {
      setCodeEditorModalContent(codeEditorModal.get('code'));
    }
  }, [codeEditorModal]);

  return codeEditorModal && codeEditorModal.get('open') ? (
    <DialogContainer>
      <Dialog>
        <Heading>Code Editor</Heading>
        <Divider />
        <Content>
          <TextArea
            UNSAFE_className="codeEditorTextArea"
            label="Code"
            width="100%"
            autoComplete="off"
            value={codeEditorModalContent}
            onChange={setCodeEditorModalContent}
          />
        </Content>
        <ButtonGroup>
          <Button
            variant="secondary"
            onPress={() =>
              handleOnClose({
                codeEditorModal,
                closeCodeEditorModal: dispatch.modals.closeCodeEditorModal
              })
            }
          >
            Cancel
          </Button>
          <Button
            variant="cta"
            onPress={() =>
              handleOnSave({
                codeEditorModal,
                codeEditorModalContent,
                closeCodeEditorModal: dispatch.modals.closeCodeEditorModal
              })
            }
          >
            Save
          </Button>
        </ButtonGroup>
      </Dialog>
    </DialogContainer>
  ) : null;
};
