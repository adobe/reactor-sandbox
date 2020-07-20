import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Map, List } from 'immutable';
import './ComponentEditSidebar.css';
import ComponentIframe from './ComponentIframe';
import Backdrop from './Backdrop';
import basePath from '../helpers/basePath';

const isNewComponent = ({
  match: {
    params: { data_element_id: dataElementId }
  },
  dataElements
}) => {
  return dataElementId === 'new' || dataElementId >= (dataElements || List()).size;
};

const getDataElement = ({
  match: {
    params: { data_element_id: dataElementId }
  },
  dataElements
}) => {
  return (
    (dataElements || List()).get(dataElementId) ||
    Map({
      modulePath: '',
      settings: null
    })
  );
};

class DataElementEdit extends Component {
  static backLink() {
    return `${basePath}/data_elements/`;
  }

  constructor(props) {
    super(props);

    this.state = {
      waitingForExtensionResponse: false,
      dataElement: getDataElement(props),
      errors: {}
    };
  }

  handleComponentTypeChange(event) {
    const { dataElement } = this.state;

    this.setState({
      dataElement: dataElement.merge({
        settings: null,
        modulePath: event.target.value
      })
    });
  }

  handleInputChange(fieldName, event) {
    const { dataElement } = this.state;
    const { target } = event;

    const value = target.type === 'checkbox' ? target.checked : target.value;
    const newDataElement = dataElement.set(fieldName, value);

    this.setState({
      dataElement: newDataElement
    });
  }

  handleSave() {
    if (!this.isValid()) {
      return false;
    }

    const {
      addDataElement,
      saveDataElement,
      currentIframe,
      history,
      match: { params }
    } = this.props;

    const { dataElement } = this.state;

    const method = isNewComponent(this.props) ? addDataElement : saveDataElement;

    this.setState({
      waitingForExtensionResponse: true
    });

    currentIframe.promise
      .then((api) => Promise.all([api.validate(), api.getSettings()]))
      .then(([isValid, settings]) => {
        if (isValid) {
          method({
            id: params.data_element_id,
            dataElement: dataElement.merge({ settings })
          });

          history.push(this.constructor.backLink());
        } else {
          this.setState({
            waitingForExtensionResponse: false
          });
        }
      });

    return true;
  }

  dataElementsList() {
    const componentList = {};
    const groupList = [];
    const { registry } = this.props;

    (registry.getIn(['components', 'dataElements']) || List()).valueSeq().forEach((v) => {
      if (!componentList[v.get('extensionDisplayName')]) {
        componentList[v.get('extensionDisplayName')] = [];
      }
      componentList[v.get('extensionDisplayName')].push(
        <option
          value={`${v.get('extensionName')}/${v.get('libPath')}`}
          key={`optionType${v.get('libPath')}`}
        >
          {v.get('displayName')}
        </option>
      );
    });

    Object.keys(componentList).forEach((extenisonDisplayName) => {
      groupList.push(
        <optgroup key={`optGroupExtension${extenisonDisplayName}`} label={extenisonDisplayName}>
          {componentList[extenisonDisplayName]}
        </optgroup>
      );
    });

    return groupList;
  }

  isValid() {
    const errors = {};
    const { dataElement } = this.state;
    const { currentIframe } = this.props;

    if (!dataElement.get('name')) {
      errors.name = true;
    }

    if (!dataElement.get('modulePath') || !currentIframe.promise) {
      errors.modulePath = true;
    }

    this.setState({ errors });
    return Object.keys(errors).length === 0;
  }

  render() {
    const { registry, extensionConfigurations } = this.props;

    const { waitingForExtensionResponse, errors, dataElement } = this.state;

    const componentIframeDetails = registry.getIn([
      'components',
      'dataElements',
      dataElement.get('modulePath')
    ]);

    const extensionName = dataElement.get('modulePath').split('/')[0];

    return (
      <div className="pure-g component-edit-container">
        {waitingForExtensionResponse ? (
          <Backdrop message="Waiting for the extension response..." />
        ) : null}
        <div className="pure-u-1-4">
          <div className="component-edit-sidebar">
            <form className="pure-form pure-form-stacked">
              <fieldset>
                <h4>Data Element Details</h4>
                <label htmlFor="dataElementName">
                  <span>Name</span>
                  <input
                    className={errors.name ? 'border-error' : ''}
                    id="dataElementName"
                    type="text"
                    value={dataElement.get('name') || ''}
                    onChange={this.handleInputChange.bind(this, 'name')}
                  />
                </label>
                <br />

                <label htmlFor="dataElementType">
                  <span>Type</span>
                  <select
                    id="dataElementType"
                    className={errors.modulePath ? 'border-error' : ''}
                    value={dataElement.get('modulePath')}
                    onChange={this.handleComponentTypeChange.bind(this)}
                  >
                    <option value="">Please select...</option>
                    {this.dataElementsList()}
                  </select>
                </label>
                <br />

                <label htmlFor="defaultValue">
                  <span>Default Value</span>
                  <input
                    id="defaultValue"
                    type="text"
                    value={dataElement.get('defaultValue') || ''}
                    onChange={this.handleInputChange.bind(this, 'defaultValue')}
                  />
                </label>
                <br />

                <label htmlFor="forceLowerCase" className="pure-checkbox">
                  <input
                    id="forceLowerCase"
                    type="checkbox"
                    checked={dataElement.get('forceLowerCase') || ''}
                    onChange={this.handleInputChange.bind(this, 'forceLowerCase')}
                  />{' '}
                  Force lower case
                </label>
                <br />
                <label htmlFor="cleanText" className="pure-checkbox">
                  <input
                    id="cleanText"
                    type="checkbox"
                    checked={dataElement.get('cleanText') || ''}
                    onChange={this.handleInputChange.bind(this, 'cleanText')}
                  />{' '}
                  Clean Text
                </label>
                <br />
                <label htmlFor="storageDuration">
                  <span>Storage duration</span>
                  <select
                    id="storageDuration"
                    value={dataElement.get('storageDuration') || ''}
                    onChange={this.handleInputChange.bind(this, 'storageDuration')}
                  >
                    <option value=""> None </option>
                    <option value="pageview"> Pageview </option>
                    <option value="session"> Session </option>
                    <option value="visitor"> Visitor </option>
                  </select>
                </label>
              </fieldset>
            </form>

            <div className="button-container">
              <button
                type="button"
                className="pure-button-primary pure-button"
                onClick={this.handleSave.bind(this)}
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
            extensionConfiguration={extensionConfigurations
              .filter((i) => i.get('name') === extensionName)
              .first()}
            settings={dataElement.get('settings')}
            server={registry.getIn(['environment', 'server'])}
          />
        </div>
      </div>
    );
  }
}

const mapState = (state) => {
  return {
    dataElements: state.dataElements,
    currentIframe: state.currentIframe,
    registry: state.registry,
    extensionConfigurations: state.extensionConfigurations
  };
};

const mapDispatch = ({ dataElements: { saveDataElement, addDataElement } }) => ({
  saveDataElement: (payload) => saveDataElement(payload),
  addDataElement: (payload) => addDataElement(payload)
});

export default withRouter(connect(mapState, mapDispatch)(DataElementEdit));
