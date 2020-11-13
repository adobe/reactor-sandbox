import React from 'react';
import ReactDOM from 'react-dom';
import { Provider, defaultTheme } from '@adobe/react-spectrum';
import Routes from './app/Routes';
import './app/index.css';

ReactDOM.render(
  <Provider theme={defaultTheme} colorScheme="light">
    <Routes />
  </Provider>,
  document.getElementById('root')
);
