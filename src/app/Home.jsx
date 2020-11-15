import React from 'react';
import { useHistory } from 'react-router-dom';
import { Button, Text } from '@adobe/react-spectrum';
import LibrarySandboxIcon from '@spectrum-icons/workflow/FileJson';
import ViewSandboxIcon from '@spectrum-icons/workflow/AdDisplay';

import NAMED_ROUTES from './constants';

import packageJson from '../../package.json';

import './Home.css';

export default () => {
  const history = useHistory();

  return (
    <div>
      <div className="intro">
        <h1>Reactor Extension Sandbox v{packageJson.version}</h1>
        <p>
          Launch, by Adobe, is a next-generation tag management solution enabling simplified
          deployment of marketing technologies.This project provides a sandbox in which you can
          manually test your views and your library logic.
        </p>

        <Button
          variant="primary"
          marginEnd="size-200"
          marginTop="size-200"
          onPress={() => {
            history.push(NAMED_ROUTES.VIEW_SANDBOX);
          }}
        >
          <ViewSandboxIcon size="L" />
          <Text>Go to View Sandbox</Text>
        </Button>

        <Button
          variant="primary"
          marginTop="size-200"
          onPress={() => {
            history.push(NAMED_ROUTES.LIB_SANDBOX);
          }}
        >
          <LibrarySandboxIcon size="L" />
          <Text>Go to Library Sandbox</Text>
        </Button>
      </div>
    </div>
  );
};
