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

import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import produce from 'immer';
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
import { NAMED_ROUTES } from '../../constants';
import ErrorMessage from '../../components/ErrorMessage';

const isNewComponent = ({ componentId, type, currentRule }) =>
  componentId === 'new' || !currentRule || componentId >= (currentRule[type] || []).length;

const getCurrentRule = ({ ruleId, rules }) => {
  const rule = (rules || [])[ruleId];

  if (!rule) {
    return {
      id: Number(ruleId),
      name: ''
    };
  }

  return {
    ...rule,
    id: Number(ruleId)
  };
};

const getComponent = ({ params: { type, component_id: componentId }, currentRule }) => {
  const ruleComponent = (currentRule[type] || [])[componentId];
  if (!ruleComponent) {
    return {
      modulePath: '',
      settings: null
    };
  }
  return ruleComponent;
};

const handleComponentTypeChange = ({ modulePath, component, setComponent }) =>
  setComponent(
    produce(component, (draft) => {
      draft.modulePath = modulePath;
      draft.settings = null;
    })
  );

const handleOrderChange = ({ order, component, setComponent }) => {
  setComponent(
    produce(component, (draft) => {
      draft.order = order;
    })
  );
};

const isComponentValid = ({ component, setErrors }) => {
  const errors = {};

  if (!component.modulePath) {
    errors.modulePath = true;
  }

  setErrors(errors);
  return Object.keys(errors).length === 0;
};

const backLink = ({ ruleId }) => `${NAMED_ROUTES.LIBRARY_EDITOR}/rules/${ruleId}`;

const handleSave = async ({
  apiPromise,
  saveMethod,
  component,
  history,
  params: { rule_id: ruleId, component_id: componentId, type },
  setWaitingForExtensionResponse,
  setErrors
}) => {
  if (!isComponentValid({ component, setErrors })) {
    return false;
  }

  setWaitingForExtensionResponse(true);

  try {
    const api = await apiPromise;
    const [isValid, settings] = await Promise.all([api.validate(), api.getSettings()]);

    if (isValid) {
      await saveMethod({
        id: componentId,
        type,
        component: produce([component, settings], ([draft, newSettings]) => {
          draft.settings = newSettings;
        })[0]
      });

      history.push(backLink({ ruleId }));
    } else {
      setWaitingForExtensionResponse(false);
    }
  } catch (e) {
    setErrors({ api: e.message });
    throw e;
  }

  return true;
};

const computeComponentList = (components = {}) => {
  const componentList = {};
  const groupList = [];

  Object.values(components).forEach((component) => {
    if (!componentList[component.extensionDisplayName]) {
      componentList[component.extensionDisplayName] = [];
    }
    componentList[component.extensionDisplayName].push({
      id: `${component.extensionName}/${component.libPath}`,
      name: component.displayName
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
  const [component, setComponent] = useState({});

  const componentList = useMemo(
    () => computeComponentList(registry.components[params.type]),
    [params.type, registry.components]
  );

  const saveMethod = useMemo(() => {
    const { addComponent, updateComponent } = dispatch.currentRule;
    return isNewComponent({ componentId: params.component_id, type: params.type, currentRule })
      ? addComponent
      : updateComponent;
  }, [dispatch.currentRule, params.component_id, params.type, currentRule]);

  const componentIframeDetails = (registry.components[params.type] || {})[component.modulePath];

  const extensionConfiguration = useMemo(() => {
    const extensionName = (component.modulePath || '').split('/')[0];
    return extensionConfigurations.filter((i) => i.name === extensionName)[0];
  }, [component.modulePath, extensionConfigurations]);

  useEffect(() => {
    let detectedRule;

    if (!currentRule) {
      detectedRule = getCurrentRule({ ruleId: params.rule_id, rules });
      dispatch.currentRule.setCurrentRule(detectedRule);
    }

    setComponent(getComponent({ params, rules, currentRule: currentRule || detectedRule }));
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
            selectedKey={component.modulePath || ''}
            onSelectionChange={(modulePath) => {
              handleComponentTypeChange({ component, setComponent, modulePath });
            }}
            width="size-3400"
            items={componentList}
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
            value={component.order || '50'}
            onChange={(order) => {
              handleOrderChange({ order, component, setComponent });
            }}
          />

          <ButtonGroup marginTop="size-150" marginBottom="size-150">
            <Button
              variant="cta"
              onPress={() => {
                handleSave({
                  apiPromise: currentIframe.promise,
                  saveMethod,
                  component,
                  history,
                  params,
                  setWaitingForExtensionResponse,
                  setErrors
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
          extensionConfiguration={extensionConfiguration}
          settings={component.settings}
          server={registry.environment.server}
        />
      </Flex>
    </>
  );
};
