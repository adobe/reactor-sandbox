import React from 'react';
import { connect } from 'react-redux';
import { Link, withRouter, useHistory } from 'react-router-dom';
import { Breadcrumbs, Item, Flex } from '@adobe/react-spectrum';

import NAMED_ROUTES from '../../../constants';
import basePath from '../helpers/basePath';

const isSavedEnabled = (match) =>
  [
    `${basePath}`,
    `${basePath}/extension_configurations`,
    `${basePath}/data_elements`,
    `${basePath}/rules`,
    `${basePath}/property_settings`
  ].indexOf(match.path) !== -1;

const Menu = ({ match, save }) => {
  const history = useHistory();

  return (
    <div className="main-menu">
      <div className="pure-menu pure-menu-horizontal">
        <Flex direction="row">
          <Breadcrumbs
            onAction={async (key) =>
              save().then(() => {
                if (key === 'reactorSandbox') {
                  history.push(NAMED_ROUTES.HOME);
                } else {
                  history.push(NAMED_ROUTES.LIB_SANDBOX);
                }
              })
            }
          >
            <Item key="reactorSandbox">Reactor Sandbox</Item>
            <Item key="libSandbox">Library Sandbox</Item>
            <Item key="libEditor">Library Editor</Item>
          </Breadcrumbs>

          <ul className="pure-menu-list">
            <li className="pure-menu-item">
              <Link
                to={`${basePath}/extension_configurations`}
                className={`pure-menu-link ${
                  match.path.endsWith('/extension_configurations') ? 'menu-selected' : ''
                }`}
              >
                Extension Configurations
              </Link>
            </li>

            <li className="pure-menu-item">
              <Link
                to={`${basePath}/data_elements`}
                className={`pure-menu-link ${
                  match.path.endsWith('/data_elements') ? 'menu-selected' : ''
                }`}
              >
                Data Elements
              </Link>
            </li>
            <li className="pure-menu-item">
              <Link
                to={`${basePath}/rules`}
                className={`pure-menu-link ${match.path.endsWith('/rules') ? 'menu-selected' : ''}`}
              >
                Rules
              </Link>
            </li>
            <li className="pure-menu-item">
              <Link
                to={`${basePath}/property_settings`}
                className={`pure-menu-link ${
                  match.path === '/property_settings' ? 'menu-selected' : ''
                }`}
              >
                Property Settings
              </Link>
            </li>
            <li className="pure-menu-item">
              <Link
                to={`${basePath}/settings`}
                className={`pure-menu-link ${
                  match.path.endsWith('/settings') ? 'menu-selected' : ''
                }`}
              >
                Settings
              </Link>
            </li>
            {isSavedEnabled(match) ? (
              <li className="pure-menu-item">
                <button
                  type="button"
                  className="pure-menu-link"
                  onClick={() => save().then(() => history.push(NAMED_ROUTES.LIB_SANDBOX))}
                >
                  Save and Exit
                </button>
              </li>
            ) : null}
          </ul>
        </Flex>
      </div>
    </div>
  );
};

const mapState = () => ({});
const mapDispatch = ({ brain: { save } }) => ({
  save: () => save()
});

export default withRouter(connect(mapState, mapDispatch)(Menu));
