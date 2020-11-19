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

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { loadIframe } from '@adobe/reactor-bridge';
import './ComponentIframe.css';

class ComponentIframe extends Component {
  componentDidMount() {
    this.renderIframe();
  }

  componentDidUpdate() {
    this.dom.innerHTML = '';
    this.renderIframe();
  }

  getUrl() {
    const { component, server } = this.props;

    if (!component) {
      return '';
    }

    const host = server.get('host');
    const port = server.get('port');
    let path = component.get('viewPath');

    if (!path) {
      path = 'noConfigIframe.html';
    }

    return `${host}:${port}/${path}`;
  }

  renderIframe() {
    const url = this.getUrl();
    const {
      openCodeEditorModal,
      openDataElementSelectorModal,
      settings,
      otherSettings,
      companySettings,
      propertySettings,
      extensionConfiguration,
      setCurrentIframe
    } = this.props;

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
    this.iframe = iframe;

    iframe.src = url;

    iframe.setAttribute('data-private', true);
    iframe.setAttribute(
      'sandbox',
      'allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts'
    );

    const iframeApi = loadIframe({
      iframe,
      container: this.dom,
      extensionInitOptions,
      connectionTimeoutDuration: 30000,
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
      },
      markAsDirty() {}
    });

    this.dom.appendChild(iframe);
    setCurrentIframe(iframeApi);
  }

  render() {
    return (
      <div
        ref={(node) => {
          this.dom = node;
        }}
        className="component-iframe"
      />
    );
  }
}

const mapState = (state) => ({
  propertySettings: state.property,
  otherSettings: state.otherSettings,
  companySettings: state.company
});
const mapDispatch = ({
  currentIframe: { setCurrentIframe },
  modals: { openCodeEditorModal, openDataElementSelectorModal }
}) => ({
  setCurrentIframe: (payload) => setCurrentIframe(payload),
  openCodeEditorModal: (payload) => openCodeEditorModal(payload),
  openDataElementSelectorModal: (payload) => openDataElementSelectorModal(payload)
});

export default connect(mapState, mapDispatch)(ComponentIframe);
