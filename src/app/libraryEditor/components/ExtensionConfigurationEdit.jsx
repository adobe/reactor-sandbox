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

/* eslint-disable no-unused-vars */

import React, { useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import produce from 'immer';
import { Flex, View, Heading, Picker, Item, ButtonGroup, Button } from '@adobe/react-spectrum';
import ComponentIframe from './ComponentIframe';
import Backdrop from './Backdrop';
import { NAMED_ROUTES } from '../../constants';
import ErrorMessage from '../../components/ErrorMessage';

const isNewExtensionConfiguration = ({ extensionConfigurations, extensionConfigurationId }) =>
  extensionConfigurationId === 'new' ||
  extensionConfigurationId >= (extensionConfigurations || []).length;

const getExtensionConfiguration = ({
  registry,
  extensionConfigurationId,
  extensionConfigurations
}) => {
  const extensionConfiguration = (extensionConfigurations || [])[extensionConfigurationId];

  if (!extensionConfiguration) {
    return {
      id: extensionConfigurationId,
      name: '',
      displayName: '',
      settings: null
    };
  }

  return {
    id: Number(extensionConfigurationId),
    displayName: (registry.extensions[extensionConfiguration.name] || {}).displayName,
    ...extensionConfiguration
  };
};

const backLink = `${NAMED_ROUTES.LIBRARY_EDITOR}/extension_configurations/`;

const handleNameChange = ({
  extensionConfiguration,
  extensionRegistryData,
  setExtensionConfiguration
}) => {
  setExtensionConfiguration(
    produce(extensionConfiguration, (draft) => {
      draft.name = extensionRegistryData.name;
      draft.displayName = extensionRegistryData.displayName;
      draft.settings = null;
    })
  );
};

const isComponentValid = ({ extensionConfiguration, setErrors }) => {
  const errors = {};

  if (!extensionConfiguration.name) {
    errors.name = true;
  }

  setErrors(errors);

  return Object.keys(errors).length === 0;
};

const handleSave = async ({
  apiPromise,
  history,
  extensionConfiguration,
  saveMethod,
  setWaitingForExtensionResponse,
  setErrors
}) => {
  if (!isComponentValid({ extensionConfiguration, setErrors })) {
    return false;
  }

  setWaitingForExtensionResponse(true);

  try {
    const api = await apiPromise;
    const [isValid, settings] = await Promise.all([api.validate(), api.getSettings()]);
    if (isValid) {
      await saveMethod(
        produce(extensionConfiguration, (draft) => {
          draft.settings = settings;
        })
      );

      history.push(backLink);
    } else {
      setWaitingForExtensionResponse(false);
    }
  } catch (e) {
    setErrors({ api: e.message });
    throw e;
  }

  return true;
};

const computeExtensionConfigurationList = (extensions = {}) => {
  return Object.entries(extensions)
    .filter(([, extension]) => extension.viewPath)
    .map(([name, extension]) => ({ id: name, name: extension.displayName }));
};

export default () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { extension_configuration_id: extensionConfigurationId } = useParams();

  const {
    currentIframe,
    registry,
    extensions: extensionConfigurations
  } = useSelector((state) => state);

  const [waitingForExtensionResponse, setWaitingForExtensionResponse] = useState(false);
  const [errors, setErrors] = useState({});
  const [extensionConfiguration, setExtensionConfiguration] = useState({});

  const extensionConfigurationList = useMemo(
    () => computeExtensionConfigurationList(registry.extensions),
    [registry.extensions]
  );

  const saveMethod = useMemo(() => {
    const { addAndSaveToContainer, updateAndSaveToContainer } = dispatch.extensions;
    return isNewExtensionConfiguration({ extensionConfigurationId, extensionConfigurations })
      ? addAndSaveToContainer
      : updateAndSaveToContainer;
  }, [dispatch.extensions, extensionConfigurationId, extensionConfigurations]);

  const componentIframeDetails = registry.extensions[extensionConfiguration.name];

  useEffect(() => {
    setExtensionConfiguration(
      getExtensionConfiguration({ registry, extensionConfigurationId, extensionConfigurations })
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
            selectedKey={extensionConfiguration.name || ''}
            onSelectionChange={(name) =>
              handleNameChange({
                extensionRegistryData: registry.extensions[name],
                extensionConfiguration,
                setExtensionConfiguration
              })
            }
            width="size-3400"
            items={extensionConfigurationList}
          >
            {(item) => <Item>{item.name}</Item>}
          </Picker>

          <ButtonGroup marginTop="size-150" marginBottom="size-150">
            <Button
              variant="cta"
              onPress={() =>
                handleSave({
                  saveMethod,
                  apiPromise: currentIframe.promise,
                  history,
                  extensionConfiguration,
                  setWaitingForExtensionResponse,
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
          settings={extensionConfiguration.settings}
          server={registry.environment.server}
        />
      </Flex>
    </>
  );
};
