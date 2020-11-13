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
