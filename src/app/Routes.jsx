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
import { HashRouter as Router, Switch, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { LastLocationProvider } from 'react-router-last-location';
import { Flex } from '@adobe/react-spectrum';

import NAMED_ROUTES from './constants';
/* eslint-disable-next-line import/no-cycle */
import Home from './Home';
import ViewSandbox from './viewSandbox';
import LibSandbox from './libSandbox';
import Menu from './components/Menu';
import ErrorBoundary from './components/ErrorBoundary';
import LibraryEditor from './libSandbox/libraryEditor';
import store from './store';

export default function App() {
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <Router>
          <LastLocationProvider>
            <Flex direction="column" height="100%">
              <Menu />
              <Switch>
                <Route exact path={NAMED_ROUTES.HOME}>
                  <Home />
                </Route>

                <Route exact path={NAMED_ROUTES.LIB_SANDBOX}>
                  <LibSandbox flex />
                </Route>

                <Route path={NAMED_ROUTES.LIB_SANDBOX_RULES_EDITOR} component={LibraryEditor} />

                <Route path={NAMED_ROUTES.VIEW_SANDBOX}>
                  <ViewSandbox flex />
                </Route>
              </Switch>
            </Flex>
          </LastLocationProvider>
        </Router>
      </ErrorBoundary>
    </Provider>
  );
}
