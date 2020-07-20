import React from 'react';
import { Switch, useRouteMatch } from 'react-router-dom';

import { dispatch } from '../../store';
import PreloaderRoute from './components/PreloaderRoute';
import Main from './components/Main';
import Settings from './components/Settings';
import PropertySettings from './components/PropertySettings';
import RulesList from './components/RulesList';
import RuleEdit from './components/RuleEdit';
import RuleComponentEdit from './components/RuleComponentEdit';
import DataElementsList from './components/DataElementsList';
import DataElementEdit from './components/DataElementEdit';
import ExtensionConfigurationsList from './components/ExtensionConfigurationsList';
import ExtensionConfigurationEdit from './components/ExtensionConfigurationEdit';

import './index.css';

export default () => {
  dispatch({ type: 'brain/initialize' });
  const { path } = useRouteMatch();

  return (
    <Switch>
      <PreloaderRoute exact path={path} component={Main} />
      <PreloaderRoute exact path={`${path}/settings`} component={Settings} />
      <PreloaderRoute exact path={`${path}/property_settings`} component={PropertySettings} />
      <PreloaderRoute exact path={`${path}/rules`} component={RulesList} />
      <PreloaderRoute exact path={`${path}/rules/:rule_id`} component={RuleEdit} />
      <PreloaderRoute
        exact
        path={`${path}/rules/:rule_id/:type(events|conditions|actions)/:component_id`}
        component={RuleComponentEdit}
      />
      <PreloaderRoute exact path={`${path}/data_elements`} component={DataElementsList} />
      <PreloaderRoute
        exact
        path={`${path}/data_elements/:data_element_id`}
        component={DataElementEdit}
      />
      <PreloaderRoute
        exact
        path={`${path}/extension_configurations`}
        component={ExtensionConfigurationsList}
      />
      <PreloaderRoute
        exact
        path={`${path}/extension_configurations/:extension_configuration_id`}
        component={ExtensionConfigurationEdit}
      />
    </Switch>
  );
};
