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

import React, { useState } from 'react';

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

export default ({ options, code, onClose, onSave }) => {
  const [codeEditorModalContent, setCodeEditorModalContent] = useState(code);
  const { language } = options;

  return (
    <DialogContainer>
      <Dialog>
        <Heading>Code Editor{language ? ` (${language})` : ''}</Heading>
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
          <Button variant="secondary" onPress={onClose}>
            Cancel
          </Button>
          <Button
            variant="cta"
            onPress={() => {
              onSave(codeEditorModalContent);
            }}
          >
            Save
          </Button>
        </ButtonGroup>
      </Dialog>
    </DialogContainer>
  );
};
