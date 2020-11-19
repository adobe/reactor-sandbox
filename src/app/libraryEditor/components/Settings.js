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
import { Button, Flex, View } from '@adobe/react-spectrum';
import OtherSettings from './OtherSettings';

import './Settings.css';

const Main = ({ brain, orgId, imsAccess, clearContainerData, clearLocalStorage }) => (
  <View margin="2rem auto" width="50rem">
    <OtherSettings key={`${orgId}${imsAccess}`} />
    <div>
      <Flex direction="row" gap="size-100" justifyContent="center" alignItems="center">
        <p>If you want to reset current data click on the `Reset data` button.</p>
        <Button
          onPress={() => {
            clearContainerData();
            clearLocalStorage();
          }}
          marginStart="size-100"
        >
          Reset data
        </Button>
      </Flex>

      {brain.get('containerDataReseted') != null ? (
        <Flex direction="row" gap="size-100" justifyContent="center" alignItems="center">
          <div className={`status-${brain.get('containerDataReseted')}`}>
            Last reset status: <strong>{brain.get('containerDataReseted')}</strong>.
          </div>
        </Flex>
      ) : null}
    </div>
  </View>
);

const mapState = (state) => ({
  brain: state.brain,
  orgId: state.company.get('orgId'),
  imsAccess: state.otherSettings.getIn(['tokens', 'imsAccess'])
});

const mapDispatch = ({ brain: { clearContainerData, clearLocalStorage } }) => ({
  clearContainerData: () => clearContainerData(),
  clearLocalStorage: () => clearLocalStorage()
});

export default withRouter(connect(mapState, mapDispatch)(Main));
