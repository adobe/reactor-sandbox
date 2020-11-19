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

/* eslint-disable react/jsx-props-no-spreading */

import React from 'react';
import { connect } from 'react-redux';
import { withRouter, Route } from 'react-router-dom';
import { Flex, Heading, ProgressCircle } from '@adobe/react-spectrum';
import Menu from './Menu';

import ModalCodeEditor from './ModalCodeEditor';
import ModalDataElementSelector from './ModalDataElementSelector';
import ErrorMessage from '../../components/ErrorMessage';

const PreloaderRoute = ({ component: Component, brain, ...rest }) => (
  <Route
    {...rest}
    render={(props) => {
      return (
        <>
          {brain.get('initialized') && (
            <>
              <ModalCodeEditor />
              <ModalDataElementSelector />
              <Flex direction="row" flex>
                <Menu />
                <Component {...props} />
              </Flex>
            </>
          )}

          {brain.get('error') && <ErrorMessage message={brain.get('error').message} />}

          {!brain.get('initialized') && !brain.get('error') && (
            <Flex direction="row" justifyContent="center" alignItems="center" marginTop="size-2000">
              <ProgressCircle aria-label="Loading…" isIndeterminate />
              <Heading marginStart="size-150">Fetching data...</Heading>
            </Flex>
          )}
        </>
      );
    }}
  />
);

const mapState = (state) => ({
  brain: state.brain
});

const mapDispatch = () => ({});

export default withRouter(connect(mapState, mapDispatch)(PreloaderRoute));
