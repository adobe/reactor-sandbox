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

/* eslint-disable react/jsx-no-bind */

import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Map, List } from 'immutable';
import {
  Flex,
  View,
  Heading,
  TextField,
  Picker,
  Section,
  Item,
  Checkbox,
  Button,
  ButtonGroup
} from '@adobe/react-spectrum';

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

  handleComponentTypeChange(modulePath) {
    const { dataElement } = this.state;

    this.setState({
      dataElement: dataElement.merge({
        settings: null,
        modulePath
      })
    });
  }

  handleInputChange(fieldName, newValue) {
    const { dataElement } = this.state;

    const newDataElement = dataElement.set(fieldName, newValue);

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
      componentList[v.get('extensionDisplayName')].push({
        id: `${v.get('extensionName')}/${v.get('libPath')}`,
        name: v.get('displayName')
      });
    });

    Object.keys(componentList).forEach((extenisonDisplayName) => {
      groupList.push({
        name: extenisonDisplayName,
        children: componentList[extenisonDisplayName]
      });
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
    const { registry, extensionConfigurations, history } = this.props;

    const { waitingForExtensionResponse, errors, dataElement } = this.state;

    const componentIframeDetails = registry.getIn([
      'components',
      'dataElements',
      dataElement.get('modulePath')
    ]);

    const extensionName = dataElement.get('modulePath').split('/')[0];

    return (
      <>
        {waitingForExtensionResponse ? (
          <Backdrop message="Waiting for the extension response..." />
        ) : null}
        <Flex direction="row" flex>
          <View
            minWidth="size-3600"
            width="size-3600"
            borderEndWidth="thin"
            borderEndColor="gray-400"
            marginStart="size-150"
          >
            <Heading level={4}>Data Element Details</Heading>
            <TextField
              label="Name"
              isRequired
              width="size-3400"
              necessityIndicator="label"
              validationState={errors.name ? 'invalid' : ''}
              value={dataElement.get('name') || ''}
              onChange={this.handleInputChange.bind(this, 'name')}
            />

            <Picker
              marginTop="size-150"
              isRequired
              necessityIndicator="label"
              validationState={errors.modulePath ? 'invalid' : ''}
              label="Type"
              selectedKey={dataElement.get('modulePath')}
              onSelectionChange={this.handleComponentTypeChange.bind(this)}
              width="size-3400"
              items={this.dataElementsList()}
            >
              {(item) => (
                <Section key={item.name} items={item.children} title={item.name}>
                  {(subitem) => <Item>{subitem.name}</Item>}
                </Section>
              )}
            </Picker>

            <TextField
              marginTop="size-150"
              label="Default Value"
              width="size-3400"
              value={dataElement.get('defaultValue') || ''}
              onChange={this.handleInputChange.bind(this, 'defaultValue')}
            />

            <Checkbox
              marginTop="size-150"
              isSelected={dataElement.get('forceLowerCase') || false}
              onChange={this.handleInputChange.bind(this, 'forceLowerCase')}
            >
              Force lower case
            </Checkbox>

            <br />

            <Checkbox
              isSelected={dataElement.get('cleanText') || false}
              onChange={this.handleInputChange.bind(this, 'cleanText')}
            >
              Clean Text
            </Checkbox>

            <Picker
              marginTop="size-150"
              label="Storage duration"
              selectedKey={dataElement.get('storageDuration') || ''}
              onSelectionChange={this.handleInputChange.bind(this, 'storageDuration')}
              width="size-3400"
              items={[
                { id: '', name: 'None' },
                { id: 'pageview', name: 'Pageview' },
                { id: 'session', name: 'Session' },
                { id: 'visitor', name: 'Visitor' }
              ]}
            >
              {(item) => <Item>{item.name}</Item>}
            </Picker>

            <ButtonGroup marginTop="size-150" marginBottom="size-150">
              <Button variant="cta" onPress={this.handleSave.bind(this)}>
                Save
              </Button>

              <Button
                variant="secondary"
                onPress={() => {
                  history.push(this.constructor.backLink());
                }}
              >
                Cancel
              </Button>
            </ButtonGroup>
          </View>

          <ComponentIframe
            component={componentIframeDetails}
            extensionConfiguration={extensionConfigurations
              .filter((i) => i.get('name') === extensionName)
              .first()}
            settings={dataElement.get('settings')}
            server={registry.getIn(['environment', 'server'])}
          />
        </Flex>
      </>
    );
  }
}

const mapState = (state) => {
  return {
    dataElements: state.dataElements,
    currentIframe: state.currentIframe,
    registry: state.registry,
    extensionConfigurations: state.extensions
  };
};

const mapDispatch = ({ dataElements: { saveDataElement, addDataElement } }) => ({
  saveDataElement: (payload) => saveDataElement(payload),
  addDataElement: (payload) => addDataElement(payload)
});

export default withRouter(connect(mapState, mapDispatch)(DataElementEdit));
