import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Map, List } from 'immutable';
import './ComponentEditSidebar.css';
import ComponentIframe from './ComponentIframe';
import Backdrop from './Backdrop';
import basePath from '../helpers/basePath';

const isNewExtensionConfiguration = ({
  extensionConfigurations,
  match: {
    params: { extension_configuration_id: extensionConfigurationId }
  }
}) =>
  extensionConfigurationId === 'new' ||
  extensionConfigurationId >= (extensionConfigurations || List()).size;

const getExtensionConfiguration = ({
  extensionConfigurations,
  match: {
    params: { extension_configuration_id: extensionConfigurationId }
  }
}) =>
  (extensionConfigurations || List()).get(extensionConfigurationId) ||
  Map({
    name: '',
    settings: null
  });

class ExtensionConfigurationEdit extends Component {
  static backLink() {
    return `${basePath}/extension_configurations/`;
  }

  constructor(props) {
    super(props);

    this.state = {
      waitingForExtensionResponse: false,
      extensionConfiguration: getExtensionConfiguration(props),
      errors: {}
    };
  }

  handleNameChange = (event) => {
    const { extensionConfiguration } = this.state;

    this.setState({
      extensionConfiguration: extensionConfiguration.merge({
        settings: null,
        name: event.target.value
      })
    });
  };

  handleSave = () => {
    if (!this.isValid()) {
      return false;
    }

    const {
      addExtensionConfiguration,
      saveExtensionConfiguration,
      currentIframe,
      history,
      registry,
      match: { params }
    } = this.props;

    const { extensionConfiguration } = this.state;
    const method = isNewExtensionConfiguration(this.props)
      ? addExtensionConfiguration
      : saveExtensionConfiguration;

    const displayName = registry.getIn([
      'extensions',
      extensionConfiguration.get('name'),
      'displayName'
    ]);

    this.setState({
      waitingForExtensionResponse: true
    });

    currentIframe.promise
      .then((api) => Promise.all([api.validate(), api.getSettings()]))
      .then(([isValid, settings]) => {
        if (isValid) {
          method({
            id: params.extension_configuration_id,
            extensionConfiguration: extensionConfiguration.merge({
              displayName,
              settings
            })
          });

          history.push(this.constructor.backLink());
        } else {
          this.setState({
            waitingForExtensionResponse: false
          });
        }
      });

    return true;
  };

  extensionConfigurationList() {
    const { registry } = this.props;
    return (registry.get('extensions') || List())
      .filter((i) => i.get('viewPath'))
      .valueSeq()
      .map((v) => (
        <option value={v.get('name')} key={`extensionConfiguration${v.get('name')}`}>
          {v.get('displayName')}
        </option>
      ));
  }

  isValid() {
    const errors = {};
    const { extensionConfiguration } = this.state;

    if (!extensionConfiguration.get('name')) {
      errors.name = true;
    }

    this.setState({ errors });
    return Object.keys(errors).length === 0;
  }

  render() {
    const { registry } = this.props;
    const { errors, extensionConfiguration, waitingForExtensionResponse } = this.state;

    const componentIframeDetails = registry.getIn([
      'extensions',
      extensionConfiguration.get('name')
    ]);

    return (
      <div className="pure-g component-edit-container">
        {waitingForExtensionResponse ? (
          <Backdrop message="Waiting for the extension response..." />
        ) : null}
        <div className="pure-u-1-4">
          <div className="component-edit-sidebar">
            <form className="pure-form pure-form-stacked">
              <fieldset>
                <h4>Extension Configuration Name</h4>
                <label htmlFor="extensionConfigurationName">
                  <span>Name</span>
                  <select
                    id="extensionConfigurationName"
                    className={errors.name ? 'border-error' : ''}
                    value={extensionConfiguration.get('name')}
                    onChange={this.handleNameChange}
                  >
                    <option value="">Please select...</option>
                    {this.extensionConfigurationList()}
                  </select>
                </label>
              </fieldset>
            </form>

            <div className="button-container">
              <button
                type="button"
                className="pure-button-primary pure-button"
                onClick={this.handleSave}
              >
                Save
              </button>
              &nbsp;
              <Link to={this.constructor.backLink()} className="pure-button">
                Cancel
              </Link>
            </div>
          </div>
        </div>
        <div className="pure-u-3-4">
          <ComponentIframe
            component={componentIframeDetails}
            settings={extensionConfiguration.get('settings')}
            server={registry.getIn(['environment', 'server'])}
          />
        </div>
      </div>
    );
  }
}

const mapState = (state) => {
  return {
    extensionConfigurations: state.extensionConfigurations,
    currentIframe: state.currentIframe,
    registry: state.registry
  };
};

const mapDispatch = ({
  extensionConfigurations: { saveExtensionConfiguration, addExtensionConfiguration }
}) => ({
  saveExtensionConfiguration: (payload) => saveExtensionConfiguration(payload),
  addExtensionConfiguration: (payload) => addExtensionConfiguration(payload)
});

export default withRouter(connect(mapState, mapDispatch)(ExtensionConfigurationEdit));
