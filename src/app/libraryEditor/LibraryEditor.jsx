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

import React, { useEffect } from 'react';
import { Switch, useRouteMatch, Redirect } from 'react-router-dom';

import { dispatch } from '../store';
import PreloaderRoute from './components/PreloaderRoute';

import Settings from './components/Settings';
import PropertySettings from './components/PropertySettings';
import RulesList from './components/RulesList';
import RuleEdit from './components/RuleEdit';
import RuleComponentEdit from './components/RuleComponentEdit';
import DataElementsList from './components/DataElementsList';
import DataElementEdit from './components/DataElementEdit';
import ExtensionConfigurationsList from './components/ExtensionConfigurationsList';
import ExtensionConfigurationEdit from './components/ExtensionConfigurationEdit';

export default () => {
  useEffect(() => {
    dispatch({ type: 'brain/initialize' });
  }, []);

  const { path } = useRouteMatch();

  return (
    <Switch>
      <Redirect exact from={path} to={`${path}/extension_configurations`} />
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
