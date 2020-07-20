import React from 'react';
import ReactDOM from 'react-dom';
import { Provider, defaultTheme } from '@adobe/react-spectrum';
import Routes from './Routes';

ReactDOM.render(
  <Provider theme={defaultTheme} colorScheme="light">
    <Routes />
  </Provider>,
  document.getElementById('root')
);
