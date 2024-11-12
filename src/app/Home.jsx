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
import { useHistory } from 'react-router-dom';
import { Button, Text, Flex, View } from '@adobe/react-spectrum';
import LibrarySandboxIcon from '@spectrum-icons/workflow/Code';
import ViewSandboxIcon from '@spectrum-icons/workflow/AdDisplay';
import ExtensionDescriptorContext from './extensionDescriptorContext';

import { NAMED_ROUTES } from './constants';
import { PLATFORMS } from '../helpers/sharedConstants';

import packageJson from '../../package.json';

export default () => {
  const history = useHistory();
  const { platform } = useContext(ExtensionDescriptorContext);

  return (
    <Flex direction="column" alignItems="center">
      <View width="30%">
        <h1>Reactor Extension Sandbox v{packageJson.version}</h1>
        <p>
          Launch, by Adobe, is a next-generation tag management solution enabling simplified
          deployment of marketing technologies. This project provides a sandbox in which you can
          manually test your views that will be displayed within Launch. Web and Edge properties are
          able to test their logic using our Library Sandbox &amp; Rule Editor.
        </p>

        <Button
          variant="primary"
          marginEnd="size-200"
          marginTop="size-200"
          onPress={() => {
            history.push(NAMED_ROUTES.VIEW_SANDBOX);
          }}
        >
          <ViewSandboxIcon marginEnd="size-50" />
          <Text>Go to View Sandbox</Text>
        </Button>

        {platform !== PLATFORMS.MOBILE && (
          <Button
            variant="primary"
            marginTop="size-200"
            onPress={() => {
              history.push(NAMED_ROUTES.LIB_SANDBOX);
            }}
          >
            <LibrarySandboxIcon marginEnd="size-50" />
            <Text>Go to Library Sandbox</Text>
          </Button>
        )}
      </View>
    </Flex>
  );
};
