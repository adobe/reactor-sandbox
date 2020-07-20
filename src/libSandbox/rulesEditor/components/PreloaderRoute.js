/* eslint-disable react/jsx-props-no-spreading */

import React from 'react';
import { connect } from 'react-redux';
import { withRouter, Route } from 'react-router-dom';
import Menu from './Menu';
import ModalCodeEditor from './ModalCodeEditor';
import ModalDataElementSelector from './ModalDataElementSelector';

const PreloaderRoute = ({ component: Component, brain, ...rest }) => (
  <Route
    {...rest}
    render={(props) =>
      brain.get('initialized') ? (
        <div className="view-container">
          <ModalCodeEditor />
          <ModalDataElementSelector />
          <Menu />
          <Component {...props} />
        </div>
      ) : (
        <div className="big-text">Fetching data...</div>
      )
    }
  />
);

const mapState = (state) => ({
  brain: state.brain
});

const mapDispatch = () => ({});

export default withRouter(connect(mapState, mapDispatch)(PreloaderRoute));
