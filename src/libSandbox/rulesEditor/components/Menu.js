import React from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import basePath from '../helpers/basePath';

import './Menu.css';

const isSavedEnabled = (match) =>
  [
    `${basePath}`,
    `${basePath}/extension_configurations`,
    `${basePath}/data_elements`,
    `${basePath}/rules`,
    `${basePath}/property_settings`
  ].indexOf(match.path) !== -1;

const Menu = ({ match, save }) => (
  <div className="main-menu">
    <div className="pure-menu pure-menu-horizontal">
      <Link className="pure-menu-heading pure-menu-link" to={`${basePath}/`}>
        Editor
      </Link>
      <ul className="pure-menu-list">
        <li className="pure-menu-item">
          <Link
            to={`${basePath}/extension_configurations`}
            className={`pure-menu-link ${
              match.path === '/extension_configurations' ? 'menu-selected' : ''
            }`}
          >
            Extension Configurations
          </Link>
        </li>

        <li className="pure-menu-item">
          <Link
            to={`${basePath}/data_elements`}
            className={`pure-menu-link ${match.path === '/data_elements' ? 'menu-selected' : ''}`}
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
            className={`pure-menu-link ${match.path === '/settings' ? 'menu-selected' : ''}`}
          >
            Settings
          </Link>
        </li>
        {isSavedEnabled(match) ? (
          <li className="pure-menu-item">
            <button type="button" className="pure-menu-link" onClick={save}>
              Save and Exit
            </button>
          </li>
        ) : null}
      </ul>
    </div>
  </div>
);

const mapState = () => ({});
const mapDispatch = ({ brain: { save } }) => ({
  save: () => save()
});

export default withRouter(connect(mapState, mapDispatch)(Menu));
