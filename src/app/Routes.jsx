/* eslint-disable no-unused-vars */

import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { LastLocationProvider } from 'react-router-last-location';
import { Flex, View } from '@adobe/react-spectrum';

import NAMED_ROUTES from './constants';
/* eslint-disable-next-line import/no-cycle */
import Home from './Home';
import ViewSandbox from './viewSandbox';
import LibSandbox from './libSandbox';
import Menu from './components/Menu';
import LibSandboxRulesEditor from './libSandbox/rulesEditor';
import store from './store';

export default function App() {
  return (
    <Provider store={store}>
      <Router>
        <LastLocationProvider>
          <Switch>
            <Route exact path={NAMED_ROUTES.HOME}>
              <div>
                <Menu />
                <Home />
              </div>
            </Route>

            <Route exact path={NAMED_ROUTES.LIB_SANDBOX}>
              <div className="lib-sandbox-container">
                <Menu />
                <LibSandbox />
              </div>
            </Route>

            <Route path={NAMED_ROUTES.LIB_SANDBOX_RULES_EDITOR} component={LibSandboxRulesEditor} />

            <Route path={NAMED_ROUTES.VIEW_SANDBOX}>
              <Flex direction="column" height="100%" UNSAFE_style={{ overflow: 'hidden' }}>
                <Menu />
                <ViewSandbox flex />
              </Flex>
            </Route>
          </Switch>
        </LastLocationProvider>
      </Router>
    </Provider>
  );
}
