import React from 'react';
import './Backdrop.css';
import { Flex, Heading, ProgressCircle } from '@adobe/react-spectrum';

export default ({ message }) => (
  <div className="backdrop backdrop-only">
    <Flex direction="row" justifyContent="center" alignItems="center" marginTop="size-2000">
      <ProgressCircle aria-label="Loading…" isIndeterminate />
      <Heading marginStart="size-150">{message}</Heading>
    </Flex>
  </div>
);
