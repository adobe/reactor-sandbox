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

import React, { useState, useEffect } from 'react';
import { Flex, View } from '@adobe/react-spectrum';

import RightColumn from './components/RightColumn';
import ShowUpgradeWarning from './components/ShowUpgradeWarning';
import ErrorMessage from '../components/ErrorMessage';
import { getStatus } from '../api/index';

export default () => {
  const [error, setError] = useState();

  const [{ isInitialized, isLatestTemplate, templateLocation }, setStatus] = useState({
    isInitialized: false,
    isLatestTemplate: null,
    templateLocation: null
  });

  useEffect(() => {
    getStatus()
      // eslint-disable-next-line no-shadow
      .then(({ librarySandbox }) => {
        // eslint-disable-next-line no-shadow
        const { isLatestTemplate, templateLocation } = librarySandbox;
        setStatus({
          isInitialized: true,
          isLatestTemplate,
          templateLocation
        });
      })
      .catch((e) => {
        setError(new Error(e));
      });
  }, []);

  return error ? (
    <ErrorMessage message={error.message} />
  ) : (
    <Flex direction="row" width="100%" height="100%" UNSAFE_style={{ overflow: 'hidden' }}>
      <View flex backgroundColor="static-white">
        {isInitialized && isLatestTemplate ? (
          <iframe
            src={`${window.EXPRESS_PUBLIC_URL}/libSandbox.html`}
            title="Reactor Lib Sandbox IFrame"
            style={{ border: 0 }}
          />
        ) : null}

        {isInitialized && !isLatestTemplate ? <ShowUpgradeWarning /> : null}
      </View>
      <View
        width="size-6000"
        borderStartWidth="thin"
        borderStartColor="gray-400"
        padding="size-200"
      >
        <RightColumn templateLocation={templateLocation} isLatestTemplate={isLatestTemplate} />
      </View>
    </Flex>
  );
};
