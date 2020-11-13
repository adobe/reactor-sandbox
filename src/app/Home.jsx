import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Text } from '@adobe/react-spectrum';
import LibrarySandboxIcon from '@spectrum-icons/workflow/FileJson';
import ViewSandboxIcon from '@spectrum-icons/workflow/AdDisplay';

import NAMED_ROUTES from './constants';

import packageJson from '../../package.json';

import './Home.css';

export default () => (
  <div>
    <div className="intro">
      <h1>Reactor Extension Sandbox v{packageJson.version}</h1>
      <p>
        Launch, by Adobe, is a next-generation tag management solution enabling simplified
        deployment of marketing technologies.This project provides a sandbox in which you can
        manually test your views and your library logic.
      </p>

      <Link to={NAMED_ROUTES.VIEW_SANDBOX}>
        <Button variant="primary" marginEnd="size-200" marginTop="size-200">
          <ViewSandboxIcon size="L" />
          <Text>Go to View Sandbox</Text>
        </Button>
      </Link>

      <Link to={NAMED_ROUTES.LIB_SANDBOX}>
        <Button variant="primary" marginTop="size-200">
          <LibrarySandboxIcon size="L" />
          <Text>Go to Library Sandbox</Text>
        </Button>
      </Link>
    </div>
  </div>
);
