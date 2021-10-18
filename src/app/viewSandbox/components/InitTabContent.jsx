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
import { ButtonGroup, Button } from '@adobe/react-spectrum';
import CodeMirrorEditor from '../../components/CodeMirrorEditor';

export default ({ onChange, content, onResetPress, onInitPress }) => {
  return (
    <>
      <CodeMirrorEditor onChange={onChange} value={content} />

      <ButtonGroup margin="size-150" position="absolute" bottom="size-0">
        <Button variant="cta" onPress={onInitPress}>
          Init
        </Button>
        <Button variant="secondary" onPress={onResetPress}>
          Reset
        </Button>
      </ButtonGroup>
    </>
  );
};
