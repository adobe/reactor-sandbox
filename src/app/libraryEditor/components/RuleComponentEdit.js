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

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
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
import NAMED_ROUTES from '../../constants';
import ErrorMessage from '../../components/ErrorMessage';

const isNewComponent = ({ componentId, type, currentRule }) =>
  componentId === 'new' || componentId >= (currentRule.get(type) || List()).size;

const getCurrentRule = ({ currentRule, rules, ruleId }) => {
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
  params: { type, component_id: componentId, rule_id: ruleId },
  rules,
  currentRule
}) => {
  const rule = getCurrentRule({ currentRule, rules, ruleId });
  return (
    rule.getIn([type, componentId]) ||
    Map({
      modulePath: '',
      settings: null
    })
  );
};

const handleComponentTypeChange = ({ modulePath, component, setComponent }) =>
  setComponent(
    component.merge({
      settings: null,
      modulePath
    })
  );

const handleOrderChange = ({ order, component, setComponent }) => {
  const newComponent = component.set('order', order);
  setComponent(newComponent);
};

const isComponentValid = ({ component, setErrors }) => {
  const errors = {};

  if (!component.get('modulePath')) {
    errors.modulePath = true;
  }

  setErrors(errors);
  return Object.keys(errors).length === 0;
};

const backLink = ({ ruleId }) => `${NAMED_ROUTES.LIBRARY_EDITOR}/rules/${ruleId}`;

const handleSave = async ({
  component,
  setErrors,
  addComponent,
  saveComponent,
  params: { rule_id: ruleId, component_id: componentId, type },
  currentRule,
  currentIframe,
  setWaitingForExtensionResponse,
  history
}) => {
  if (!isComponentValid({ component, setErrors })) {
    return false;
  }

  const method = isNewComponent({ componentId, type, currentRule }) ? addComponent : saveComponent;

  setWaitingForExtensionResponse(true);

  try {
    const api = await currentIframe.promise;
    const [isValid, settings] = await Promise.all([api.validate(), api.getSettings()]);

    if (isValid) {
      await method({
        id: componentId,
        type,
        component: component.merge({ settings })
      });

      history.push(backLink({ ruleId }));
    } else {
      setWaitingForExtensionResponse(false);
    }
  } catch (e) {
    setErrors({ api: e.message });
  }

  return true;
};

const getComponentList = ({ type, registry }) => {
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
};

export default () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const params = useParams();

  const {
    rules,
    currentRule,
    currentIframe,
    registry,
    extensions: extensionConfigurations
  } = useSelector((state) => state);

  const [waitingForExtensionResponse, setWaitingForExtensionResponse] = useState(false);
  const [errors, setErrors] = useState({});
  const [component, setComponent] = useState(Map());

  const componentIframeDetails = registry.getIn([
    'components',
    params.type,
    component.get('modulePath')
  ]);

  const extensionName = (component.get('modulePath') || '').split('/')[0];

  useEffect(() => {
    const c = getCurrentRule({ currentRule, rules, ruleId: params.rule_id });
    dispatch.currentRule.setCurrentRule(c);
    setComponent(getComponent({ params, rules, currentRule }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return errors.api ? (
    <View flex>
      <ErrorMessage message={errors.api} />
    </View>
  ) : (
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
            selectedKey={component.get('modulePath') || ''}
            onSelectionChange={(modulePath) => {
              handleComponentTypeChange({ component, setComponent, modulePath });
            }}
            width="size-3400"
            items={getComponentList({ type: params.type, registry })}
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
            onChange={(order) => {
              handleOrderChange({ order, component, setComponent });
            }}
          />

          <ButtonGroup marginTop="size-150" marginBottom="size-150">
            <Button
              variant="cta"
              onPress={() => {
                handleSave({
                  component,
                  setErrors,
                  addComponent: dispatch.currentRule.addComponent,
                  saveComponent: dispatch.currentRule.saveComponent,
                  params,
                  currentRule,
                  currentIframe,
                  setWaitingForExtensionResponse,
                  history
                });
              }}
            >
              Save
            </Button>

            <Button
              variant="secondary"
              onPress={() => {
                history.push(backLink({ ruleId: params.rule_id }));
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
};
