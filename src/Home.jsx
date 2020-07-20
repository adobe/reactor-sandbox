import React from 'react';
import { Link } from 'react-router-dom';
import NAMED_ROUTES from './constants';

export default () => (
  <>
    <h1>Home</h1>
    <nav>
      <Link to={NAMED_ROUTES.VIEW_SANDBOX}>View Sandbox</Link>
      <br />
      <Link to={NAMED_ROUTES.LIB_SANDBOX}>Lib Sandbox</Link>
    </nav>
  </>
);
