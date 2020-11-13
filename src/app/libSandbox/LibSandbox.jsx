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
