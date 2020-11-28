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

import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { loadIframe } from '@adobe/reactor-bridge';

const getUrl = ({ component, server }) => {
  if (!component) {
    return '';
  }

  let path = component.get('viewPath');

  if (!path) {
    path = 'noConfigIframe.html';
  }

  const host = server.get('host');
  const port = server.get('port');
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
    settings: settings && settings.toJS(),
    company: companySettings.toJS(),
    propertySettings: propertySettings.toJS(),
    tokens: otherSettings.get('tokens').toJS()
  };

  if (extensionConfiguration) {
    extensionInitOptions.extensionSettings = extensionConfiguration.get('settings').toJS();
  }

  const iframe = document.createElement('iframe');
  iframe.src = url;

  iframe.setAttribute('data-private', true);
  iframe.setAttribute(
    'sandbox',
    'allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts'
  );

  const iframeApi = loadIframe({
    iframe,
    extensionInitOptions,
    openCodeEditor(options = {}) {
      return new Promise((resolve, reject) => {
        openCodeEditorModal({
          code: options.code,
          onSave: resolve,
          onClose: reject
        });
      }).catch(() => {});
    },
    openRegexTester() {},
    openDataElementSelector() {
      return new Promise((resolve, reject) => {
        openDataElementSelectorModal({
          onSave: resolve,
          onClose: reject
        });
      }).catch(() => '');
    }
  });

  iframeRef.current.appendChild(iframe);
  setCurrentIframe(iframeApi);
};

export default ({ component, extensionConfiguration, settings, server }) => {
  const iframeRef = useRef();
  const { property: propertySettings, otherSettings, company: companySettings } = useSelector(
    (state) => state
  );
  const dispatch = useDispatch();

  useEffect(() => {
    iframeRef.current.innerHTML = '';
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

  return <div ref={iframeRef} className="component-iframe" />;
};
