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
      propertySettings,
      extensionConfiguration,
      setCurrentIframe
    } = this.props;

    if (!url) {
      return;
    }

    const extensionInitOptions = {
      settings: settings && settings.toJS(),
      company: otherSettings.get('company').toJS(),
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
  propertySettings: state.propertySettings,
  otherSettings: state.otherSettings
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
