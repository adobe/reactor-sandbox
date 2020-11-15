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
import { Flex, View } from '@adobe/react-spectrum';
import Alert from '@spectrum-icons/workflow/Alert';

export default () => (
  <Flex
    direction="row"
    marginTop="size-1000"
    marginStart="size-2000"
    marginEnd="size-2000"
    justifyContent="center"
  >
    <View borderWidth="thin" borderColor="dark" borderRadius="medium" padding="size-250">
      <Flex direction="row" gap="size-50">
        <Alert color="notice" minWidth="size-500" />
        <p style={{ marginTop: '0.3rem' }}>
          <strong>Warning!</strong> We have detected that the file `.sandbox/libSandbox.html`,
          contains an older template that is no longer supported. In order to use the latest
          template you need to run <strong>`npx @adobe/reactor-sandbox init`</strong> inside your
          extension folder. For more informations you can check the{' '}
          <a
            href="https://www.npmjs.com/package/@adobe/reactor-sandbox#configuring-the-sandbox"
            rel="noreferrer"
            target="_blank"
          >
            documentation
          </a>{' '}
          . Save the old files to a different location first in order to be able to migrate the
          content to the new template.
        </p>
      </Flex>
    </View>
  </Flex>
);
