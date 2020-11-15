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
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Button, Flex } from '@adobe/react-spectrum';
import OtherSettings from './OtherSettings';

const Main = ({ brain, orgId, imsAccess, loadContainerData, clearContainerData }) => {
  return (
    <div>
      <OtherSettings key={`${orgId}${imsAccess}`} />
      <div className="main-container">
        <p>The data used inside this editor is loaded from `localStorage`.</p>
        <Flex direction="row" gap="size-100" justifyContent="center" alignItems="center">
          <p>
            If you want to overwrite the current data with the one stored inside the{' '}
            <strong>`.sandbox/container.js`</strong> file click on the `Import data` button.
          </p>
          <Button onPress={loadContainerData}>Import data</Button>
        </Flex>
        {brain.get('containerDataLoaded') != null ? (
          <div className={`status-${brain.get('containerDataLoaded')}`}>
            Last import status: <strong>{brain.get('containerDataLoaded')}</strong>.
          </div>
        ) : null}

        <Flex direction="row" gap="size-100" justifyContent="center" alignItems="center">
          <p>If you want to reset current data click on the `Reset data` button.</p>
          <Button onPress={clearContainerData} marginStart="size-100">
            Reset data
          </Button>
        </Flex>

        {brain.get('containerDataReseted') != null ? (
          <div className={`status-${brain.get('containerDataReseted')}`}>
            Last reset status: <strong>{brain.get('containerDataReseted')}</strong>.
          </div>
        ) : null}
      </div>
    </div>
  );
};

const mapState = (state) => ({
  brain: state.brain,
  orgId: state.otherSettings.getIn(['company', 'orgId']),
  imsAccess: state.otherSettings.getIn(['tokens', 'imsAccess'])
});

const mapDispatch = ({ brain: { loadContainerData, clearContainerData } }) => ({
  loadContainerData: () => loadContainerData(),
  clearContainerData: () => clearContainerData()
});

export default withRouter(connect(mapState, mapDispatch)(Main));
