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
