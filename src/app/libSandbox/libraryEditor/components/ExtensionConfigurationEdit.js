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
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Map, List } from 'immutable';
import { Flex, View, Heading, Picker, Item, ButtonGroup, Button } from '@adobe/react-spectrum';
import ComponentIframe from './ComponentIframe';
import Backdrop from './Backdrop';
import NAMED_ROUTES from '../../../constants';

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
    return `${NAMED_ROUTES.LIB_SANDBOX_RULES_EDITOR}/extension_configurations/`;
  }

  constructor(props) {
    super(props);

    this.state = {
      waitingForExtensionResponse: false,
      extensionConfiguration: getExtensionConfiguration(props),
      errors: {}
    };
  }

  handleNameChange = (name) => {
    const { extensionConfiguration } = this.state;

    this.setState({
      extensionConfiguration: extensionConfiguration.merge({
        settings: null,
        name
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
      .map((v) => ({ id: v.get('name'), name: v.get('displayName') }));
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
    const { registry, history } = this.props;
    const { errors, extensionConfiguration, waitingForExtensionResponse } = this.state;

    const componentIframeDetails = registry.getIn([
      'extensions',
      extensionConfiguration.get('name')
    ]);

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
            <Heading level={4}>Extension Configuration Name</Heading>
            <Picker
              marginTop="size-150"
              label="Name"
              isRequired
              necessityIndicator="label"
              validationState={errors.name ? 'invalid' : ''}
              selectedKey={extensionConfiguration.get('name')}
              onSelectionChange={this.handleNameChange}
              width="size-3400"
              items={this.extensionConfigurationList()}
            >
              {(item) => <Item>{item.name}</Item>}
            </Picker>

            <ButtonGroup marginTop="size-150" marginBottom="size-150">
              <Button variant="cta" onPress={this.handleSave}>
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
            settings={extensionConfiguration.get('settings')}
            server={registry.getIn(['environment', 'server'])}
          />
        </Flex>
      </>
    );
  }
}

const mapState = (state) => {
  return {
    extensionConfigurations: state.extensions,
    currentIframe: state.currentIframe,
    registry: state.registry
  };
};

const mapDispatch = ({
  extensions: { saveExtensionConfiguration, addExtensionConfiguration }
}) => ({
  saveExtensionConfiguration: (payload) => saveExtensionConfiguration(payload),
  addExtensionConfiguration: (payload) => addExtensionConfiguration(payload)
});

export default withRouter(connect(mapState, mapDispatch)(ExtensionConfigurationEdit));
