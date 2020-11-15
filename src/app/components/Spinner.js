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
import { ProgressCircle, Flex, Text } from '@adobe/react-spectrum';

export default () => (
  <Flex direction="row" marginTop="size-1000" justifyContent="center">
    <ProgressCircle aria-label="Loading…" isIndeterminate />
    <Text alignSelf="center" marginStart="size-125">
      Loading ...
    </Text>
  </Flex>
);
