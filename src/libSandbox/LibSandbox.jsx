import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@adobe/react-spectrum';
import NAMED_ROUTES from '../constants';

export default () => (
  <>
    <h1 className="coral-Heading coral-Heading--1">React Reactor Extension Library Sandbox</h1>
    <div className="nav">
      <Link
        to={NAMED_ROUTES.LIB_SANDBOX_RULES_EDITOR}
        component={({ navigate }) => {
          return (
            <Button variant="secondary" isQuiet onClick={navigate}>
              Go to rule editor
            </Button>
          );
        }}
      />
      <Link
        to={NAMED_ROUTES.VIEW_SANDBOX}
        component={({ navigate }) => {
          return (
            <Button variant="secondary" isQuiet onClick={navigate}>
              Go to view sandbox
            </Button>
          );
        }}
      />
    </div>
    <p>
      To customize the iframe below, check out the{' '}
      <a
        href="https://www.npmjs.com/package/@adobe/reactor-sandbox#configuring-the-sandbox"
        target="_blank"
        rel="noreferrer"
      >
        documentation
      </a>
    </p>
    <iframe
      style={{ width: '100%', height: 5000 }}
      title="librarySandbox"
      src={`${window.EXPRESS_PUBLIC_URL}/libSandbox.html`}
    />
  </>
);
