import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { LastLocationProvider } from 'react-router-last-location';

import NAMED_ROUTES from './constants';
/* eslint-disable-next-line import/no-cycle */
import Home from './Home';
import ViewSandbox from './ViewSandbox';
import LibSandbox from './LibSandbox';
import LibSandboxRulesEditor from './LibSandbox/rulesEditor';
import store from './store';

export default function App() {
  return (
    <Provider store={store}>
      <Router>
        <LastLocationProvider>
          <Switch>
            <Route exact path={NAMED_ROUTES.HOME} component={Home} />
            <Route exact path={NAMED_ROUTES.LIB_SANDBOX} component={LibSandbox} />

            <Route path={NAMED_ROUTES.LIB_SANDBOX_RULES_EDITOR} component={LibSandboxRulesEditor} />

            <Route path={NAMED_ROUTES.VIEW_SANDBOX}>
              <ViewSandbox />
            </Route>
          </Switch>
        </LastLocationProvider>
      </Router>
    </Provider>
  );
}
