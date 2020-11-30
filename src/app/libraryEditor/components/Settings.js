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
import { useDispatch, useSelector } from 'react-redux';
import { Button, Flex, View } from '@adobe/react-spectrum';
import OtherSettings from './OtherSettings';

import './Settings.css';

export default () => {
  const brain = useSelector((state) => state.brain);
  const orgId = useSelector((state) => state.company.get('orgId'));
  const imsAccess = useSelector((state) => state.otherSettings.getIn(['tokens', 'imsAccess']));
  const dispatch = useDispatch();

  return (
    <View margin="2rem auto" width="50rem">
      <OtherSettings key={`${orgId}${imsAccess}`} />
      <div>
        <Flex direction="row" gap="size-100" justifyContent="center" alignItems="center">
          <p>
            If you want to have a start fresh with an empty library, you can click on the `Reset
            data` button.
          </p>
          <Button
            onPress={() => {
              return Promise.all([
                dispatch.brain.clearContainerData(),
                dispatch.brain.clearLocalStorage()
              ]);
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
};
