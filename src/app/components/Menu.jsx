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
import { Link, withRouter, useHistory } from 'react-router-dom';
import { Breadcrumbs, Item, Flex } from '@adobe/react-spectrum';
import NAMED_ROUTES from '../constants';

const Menu = ({ location }) => {
  const history = useHistory();

  return (
    <div className="main-menu">
      <div className="pure-menu pure-menu-horizontal">
        <Flex direction="row">
          <Breadcrumbs onAction={() => history.push(NAMED_ROUTES.HOME)}>
            <Item key="reactorSandbox">Reactor Sandbox</Item>
            {location.pathname === NAMED_ROUTES.VIEW_SANDBOX ? (
              <Item key="viewEditor">View Sandbox</Item>
            ) : null}{' '}
            {location.pathname === NAMED_ROUTES.LIB_SANDBOX ? (
              <Item key="libEditor">Library Sandbox</Item>
            ) : null}
          </Breadcrumbs>

          <ul className="pure-menu-list">
            <li className="pure-menu-item">
              <Link
                to={NAMED_ROUTES.VIEW_SANDBOX}
                className={`pure-menu-link ${
                  location.pathname === NAMED_ROUTES.VIEW_SANDBOX ? 'menu-selected' : ''
                }`}
              >
                View Sandbox
              </Link>
            </li>

            <li className="pure-menu-item">
              <Link
                to={NAMED_ROUTES.LIB_SANDBOX}
                className={`pure-menu-link ${
                  location.pathname.startsWith(NAMED_ROUTES.LIB_SANDBOX) ? 'menu-selected' : ''
                }`}
              >
                Library Sandbox
              </Link>
            </li>
          </ul>
        </Flex>
      </div>
    </div>
  );
};

export default withRouter(Menu);
