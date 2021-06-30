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

/* eslint-disable no-unused-vars */

import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { loadIframe } from '@adobe/reactor-bridge';

import './ComponentIframe.css';

const getUrl = ({ component, server }) => {
  if (!component) {
    return '';
  }

  let path = component.viewPath;

  if (!path) {
    path = 'noConfigIframe.html';
  }

  const { host, port } = server;
  return `${host}:${port}/${path}`;
};

const renderIframe = ({
  settings,
  otherSettings,
  companySettings,
  propertySettings,
  extensionConfiguration,
  component,
  server,
  iframeRef,
  dispatch: {
    currentIframe: { setCurrentIframe },
    modals: { openCodeEditorModal, openDataElementSelectorModal }
  }
}) => {
  const url = getUrl({ component, server });

  if (!url) {
    return;
  }

  const extensionInitOptions = {
    settings,
    company: companySettings,
    propertySettings: propertySettings.settings,
    tokens: otherSettings.tokens
  };

  if (extensionConfiguration) {
    extensionInitOptions.extensionSettings = extensionConfiguration.settings;
  }

  const iframe = iframeRef.current;
  iframe.src = url;

  const iframeApi = loadIframe({
    iframe,
    extensionInitOptions,
    openCodeEditor(options = {}) {
      return new Promise((resolve, reject) => {
        openCodeEditorModal({ options, code: options.code, onSave: resolve, onClose: reject });
      }).catch(() => {});
    },
    openRegexTester() {},
    openDataElementSelector(options = {}) {
      return new Promise((resolve, reject) => {
        openDataElementSelectorModal({
          options,
          onSave: resolve,
          onClose: reject
        });
      }).catch(() => '');
    }
  });

  setCurrentIframe(iframeApi);
};

export default ({ component, extensionConfiguration, settings, server }) => {
  const iframeRef = useRef();
  const {
    property: propertySettings,
    otherSettings,
    company: companySettings
  } = useSelector((state) => state);
  const dispatch = useDispatch();

  useEffect(() => {
    renderIframe({
      settings,
      otherSettings,
      companySettings,
      propertySettings,
      extensionConfiguration,
      component,
      server,
      iframeRef,
      dispatch
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [component]);

  return (
    <div className="component-iframe">
      <iframe
        title="iframe"
        data-private="true"
        sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
        ref={iframeRef}
      />
    </div>
  );
};
