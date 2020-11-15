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

import RightColumn from './components/RightColumn';
import ShowUpgradeWarning from './components/ShowUpgradeWarning';

import './LibSandbox.css';

export default () => {
  const [{ isInitialized, isLatestTemplate, templateLocation }, setStatus] = useState({
    isInitialized: false,
    isLatestTemplate: null,
    templateLocation: null
  });

  useEffect(() => {
    fetch(`${window.EXPRESS_PUBLIC_URL}/status`)
      .then((data) => data.json())
      // eslint-disable-next-line no-shadow
      .then(({ librarySandbox: { isLatestTemplate, templateLocation } }) =>
        setStatus({
          isInitialized: true,
          isLatestTemplate,
          templateLocation
        })
      );
  }, []);

  return (
    <div className="lib-sandbox-content-container">
      <div className="iframe-container">
        {isInitialized && isLatestTemplate ? (
          <iframe
            src={`${window.EXPRESS_PUBLIC_URL}/libSandbox.html`}
            title="Reactor Lib Sandbox IFrame"
            style={{ border: 0 }}
          />
        ) : null}

        {isInitialized && !isLatestTemplate ? <ShowUpgradeWarning /> : null}
      </div>
      <RightColumn templateLocation={templateLocation} isLatestTemplate={isLatestTemplate} />
    </div>
  );
};
