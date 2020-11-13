/* eslint-disable react/jsx-props-no-spreading */

import React from 'react';
import { connect } from 'react-redux';
import { withRouter, Route } from 'react-router-dom';
import { Flex, Heading, ProgressCircle } from '@adobe/react-spectrum';
import Menu from './Menu';
import ModalCodeEditor from './ModalCodeEditor';
import ModalDataElementSelector from './ModalDataElementSelector';

const PreloaderRoute = ({ component: Component, brain, ...rest }) => (
  <Route
    {...rest}
    render={(props) =>
      brain.get('initialized') ? (
        <>
          <ModalCodeEditor />
          <ModalDataElementSelector />
          <Flex direction="column" height="100%">
            <Menu />
            <Component {...props} />
          </Flex>
        </>
      ) : (
        <>
          <Flex direction="row" justifyContent="center" alignItems="center" marginTop="size-2000">
            <ProgressCircle aria-label="Loading…" isIndeterminate />
            <Heading marginStart="size-150">Fetching data...</Heading>
          </Flex>
        </>
      )
    }
  />
);

const mapState = (state) => ({
  brain: state.brain
});

const mapDispatch = () => ({});

export default withRouter(connect(mapState, mapDispatch)(PreloaderRoute));
