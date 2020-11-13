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
import { ButtonGroup, Button, Flex } from '@adobe/react-spectrum';
import CodeMirrorEditor from './CodeMirrorEditor';
import getDefaultInitInfo from './helpers/getDefaultInitInfo';

const getInitContent = (selectedDescriptor) => {
  console.log('getInitContent', getDefaultInitInfo(selectedDescriptor));
  return JSON.stringify(getDefaultInitInfo(selectedDescriptor), null, 2);
};

export default ({ selectedDescriptor }) => {
  const [codeContent, setCodeContent] = useState();

  useEffect(() => {
    setCodeContent(getInitContent(selectedDescriptor));
  }, [selectedDescriptor]);

  return (
    <>
      <CodeMirrorEditor onChange={setCodeContent} value={codeContent} />

      <ButtonGroup margin="size-150" position="absolute" bottom="size-0" width="100%">
        <Flex direction="row" width="100%">
          <Button variant="cta" flex>
            Init
          </Button>
          <Button variant="secondary" marginEnd="size-300">
            Reset
          </Button>
        </Flex>
      </ButtonGroup>
    </>
  );
};
