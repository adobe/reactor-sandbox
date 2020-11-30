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
import { useSelector, useDispatch } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import { Map, List } from 'immutable';
import { Flex, View, Heading, Picker, Item, ButtonGroup, Button } from '@adobe/react-spectrum';
import ComponentIframe from './ComponentIframe';
import Backdrop from './Backdrop';
import NAMED_ROUTES from '../../constants';
import ErrorMessage from '../../components/ErrorMessage';

const isNewExtensionConfiguration = ({ extensionConfigurations, extensionConfigurationId }) =>
  extensionConfigurationId === 'new' ||
  extensionConfigurationId >= (extensionConfigurations || List()).size;

const getExtensionConfiguration = ({ extensionConfigurations, extensionConfigurationId }) =>
  (extensionConfigurations || List()).get(extensionConfigurationId) ||
  Map({
    name: '',
    settings: null
  });

const backLink = `${NAMED_ROUTES.LIBRARY_EDITOR}/extension_configurations/`;

const handleNameChange = ({ name, extensionConfiguration, setExtensionConfiguration }) => {
  setExtensionConfiguration(
    extensionConfiguration.merge({
      settings: null,
      name
    })
  );
};

const isComponentValid = ({ extensionConfiguration, setErrors }) => {
  const errors = {};

  if (!extensionConfiguration.get('name')) {
    errors.name = true;
  }

  setErrors(errors);

  return Object.keys(errors).length === 0;
};

const handleSave = async ({
  dispatch: {
    extensions: { saveExtensionConfiguration, addExtensionConfiguration }
  },
  currentIframe,
  history,
  extensionConfigurationId,
  extensionConfiguration,
  extensionConfigurations,
  setWaitingForExtensionResponse,
  registry,
  setErrors
}) => {
  if (!isComponentValid({ extensionConfiguration, setErrors })) {
    return false;
  }

  const method = isNewExtensionConfiguration({ extensionConfigurationId, extensionConfigurations })
    ? addExtensionConfiguration
    : saveExtensionConfiguration;

  const displayName = registry.getIn([
    'extensions',
    extensionConfiguration.get('name'),
    'displayName'
  ]);

  setWaitingForExtensionResponse(true);

  try {
    const api = await currentIframe.promise;
    const [isValid, settings] = await Promise.all([api.validate(), api.getSettings()]);
    if (isValid) {
      await method({
        id: extensionConfigurationId,
        extensionConfiguration: extensionConfiguration.merge({
          displayName,
          settings
        })
      });

      history.push(backLink);
    } else {
      setWaitingForExtensionResponse(false);
    }
  } catch (e) {
    setErrors({ api: e.message });
  }

  return true;
};

const extensionConfigurationList = ({ registry }) => {
  return (registry.get('extensions') || List())
    .filter((i) => i.get('viewPath'))
    .valueSeq()
    .map((v) => ({ id: v.get('name'), name: v.get('displayName') }));
};

export default () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { extension_configuration_id: extensionConfigurationId } = useParams();

  const { currentIframe, registry, extensions: extensionConfigurations } = useSelector(
    (state) => state
  );

  const [waitingForExtensionResponse, setWaitingForExtensionResponse] = useState(false);
  const [errors, setErrors] = useState({});
  const [extensionConfiguration, setExtensionConfiguration] = useState(Map());
  const componentIframeDetails = registry.getIn(['extensions', extensionConfiguration.get('name')]);

  useEffect(() => {
    setExtensionConfiguration(
      getExtensionConfiguration({ extensionConfigurationId, extensionConfigurations })
    );
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
          <Heading level={4}>Extension Configuration Name</Heading>
          <Picker
            marginTop="size-150"
            label="Name"
            isRequired
            necessityIndicator="label"
            validationState={errors.name ? 'invalid' : ''}
            selectedKey={extensionConfiguration.get('name') || ''}
            onSelectionChange={(name) =>
              handleNameChange({ name, extensionConfiguration, setExtensionConfiguration })
            }
            width="size-3400"
            items={extensionConfigurationList({ registry })}
          >
            {(item) => <Item>{item.name}</Item>}
          </Picker>

          <ButtonGroup marginTop="size-150" marginBottom="size-150">
            <Button
              variant="cta"
              onPress={() =>
                handleSave({
                  dispatch,
                  currentIframe,
                  history,
                  extensionConfigurationId,
                  extensionConfiguration,
                  extensionConfigurations,
                  setWaitingForExtensionResponse,
                  registry,
                  setErrors
                })
              }
            >
              Save
            </Button>

            <Button
              variant="secondary"
              onPress={() => {
                history.push(backLink);
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
};
