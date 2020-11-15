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
import {
  Flex,
  View,
  Heading,
  TextField,
  Picker,
  Section,
  Item,
  Button,
  ButtonGroup
} from '@adobe/react-spectrum';
import ComponentIframe from './ComponentIframe';
import Backdrop from './Backdrop';
import basePath from '../helpers/basePath';

const isNewComponent = (componentId, type, currentRule) =>
  componentId === 'new' || componentId >= (currentRule.get(type) || List()).size;

const getCurrentRule = (currentRule, rules, ruleId) => {
  let rule;

  if (currentRule && currentRule.get('id') === ruleId) {
    rule = currentRule;
  } else {
    rule = (rules || List()).get(ruleId) || Map();
  }
  rule = rule.set('id', ruleId);
  return rule;
};

const getComponent = ({
  match: {
    params: { type, component_id: componentId, rule_id: ruleId }
  },
  rules,
  currentRule
}) => {
  const rule = getCurrentRule(currentRule, rules, ruleId);
  return (
    rule.getIn([type, componentId]) ||
    Map({
      modulePath: '',
      settings: null
    })
  );
};

class RuleComponentEdit extends Component {
  constructor(props) {
    super(props);

    const currentRule = getCurrentRule(props.currentRule, props.rules, props.match.params.rule_id);

    this.state = {
      errors: {},
      waitingForExtensionResponse: false,
      component: getComponent(props),
      currentRule
    };

    props.setCurrentRule(currentRule);
  }

  handleComponentTypeChange = (modulePath) => {
    const { component } = this.state;

    this.setState({
      component: component.merge({
        settings: null,
        modulePath
      })
    });
  };

  handleOrderChange = (value) => {
    const { component } = this.state;

    const newComponent = component.set('order', value);
    this.setState({ component: newComponent });
  };

  handleSave = () => {
    if (!this.isValid()) {
      return false;
    }

    const { component } = this.state;

    const {
      addComponent,
      saveComponent,
      match: {
        params: { component_id: componentId, type }
      },
      currentIframe,
      history
    } = this.props;

    const { currentRule } = this.state;

    const method = isNewComponent(componentId, type, currentRule) ? addComponent : saveComponent;

    this.setState({
      waitingForExtensionResponse: true
    });

    currentIframe.promise
      .then((api) => Promise.all([api.validate(), api.getSettings()]))
      .then(([isValid, settings]) => {
        if (isValid) {
          method({
            id: componentId,
            type,
            component: component.merge({ settings })
          });

          history.push(this.backLink());
        } else {
          this.setState({
            waitingForExtensionResponse: false
          });
        }
      });

    return true;
  };

  componentList() {
    const {
      match: {
        params: { type }
      },
      registry
    } = this.props;
    const componentList = {};
    const groupList = [];

    (registry.getIn(['components', type]) || List()).valueSeq().forEach((v) => {
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
    const { component } = this.state;

    if (!component.get('modulePath')) {
      errors.modulePath = true;
    }

    this.setState({ errors });
    return Object.keys(errors).length === 0;
  }

  backLink() {
    const {
      match: {
        params: { rule_id: ruleId }
      }
    } = this.props;

    return `${basePath}/rules/${ruleId}`;
  }

  render() {
    const { waitingForExtensionResponse, component, errors } = this.state;
    const {
      match: {
        params: { type }
      },
      history,
      registry,
      extensionConfigurations
    } = this.props;

    const componentIframeDetails = registry.getIn([
      'components',
      type,
      component.get('modulePath')
    ]);

    const extensionName = component.get('modulePath').split('/')[0];

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
            <Heading level={4}>Component Details</Heading>

            <Picker
              marginTop="size-150"
              isRequired
              necessityIndicator="label"
              validationState={errors.modulePath ? 'invalid' : ''}
              label="Type"
              selectedKey={component.get('modulePath')}
              onSelectionChange={this.handleComponentTypeChange}
              width="size-3400"
              items={this.componentList()}
            >
              {(item) => (
                <Section key={item.name} items={item.children} title={item.name}>
                  {(subitem) => <Item>{subitem.name}</Item>}
                </Section>
              )}
            </Picker>

            <TextField
              marginTop="size-150"
              label="Order"
              width="size-3400"
              value={component.get('order') || '50'}
              onChange={this.handleOrderChange}
            />

            <ButtonGroup marginTop="size-150" marginBottom="size-150">
              <Button variant="cta" onPress={this.handleSave}>
                Save
              </Button>

              <Button
                variant="secondary"
                onPress={() => {
                  history.push(this.backLink());
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
            settings={component.get('settings')}
            server={registry.getIn(['environment', 'server'])}
          />
        </Flex>
      </>
    );
  }
}

const mapState = (state) => {
  return {
    rules: state.rules,
    currentRule: state.currentRule,
    currentIframe: state.currentIframe,
    registry: state.registry,
    extensionConfigurations: state.extensionConfigurations
  };
};

const mapDispatch = ({
  rules: { saveRule },
  currentRule: { setCurrentRule, saveComponent, addComponent }
}) => ({
  saveRule: (payload) => saveRule(payload),
  setCurrentRule: (payload) => setCurrentRule(payload),
  saveComponent: (payload) => saveComponent(payload),
  addComponent: (payload) => addComponent(payload)
});

export default withRouter(connect(mapState, mapDispatch)(RuleComponentEdit));
