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

import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
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
  Checkbox,
  Button,
  ButtonGroup
} from '@adobe/react-spectrum';

import ComponentIframe from './ComponentIframe';
import Backdrop from './Backdrop';
import NAMED_ROUTES from '../../constants';
import ErrorMessage from '../../components/ErrorMessage';
import ExtensionDescriptorContext from '../../extensionDescriptorContext';

const isNewDataElement = ({ dataElementId, dataElements }) => {
  return dataElementId === 'new' || dataElementId >= (dataElements || []).length;
};

const getDataElement = ({ dataElementId, dataElements }) => {
  const dataElement = (dataElements || [])[dataElementId];

  if (!dataElement) {
    return {
      id: dataElementId,
      name: '',
      settings: null,
      cleanText: false,
      enableDefaultValue: false,
      defaultValue: '',
      forceLowerCase: false,
      modulePath: '',
      storageDuration: ''
    };
  }

  return {
    ...dataElement,
    id: Number(dataElementId),
    enableDefaultValue: Object.keys(dataElement).includes('defaultValue'),
    defaultValue: dataElement.defaultValue || ''
  };
};

const backLink = `${NAMED_ROUTES.LIBRARY_EDITOR}/data_elements/`;

const handleComponentTypeChange = ({ modulePath, dataElement, setDataElement }) => {
  setDataElement(
    produce(dataElement, (draft) => {
      draft.modulePath = modulePath;
      draft.settings = null;
    })
  );
};

const handleInputChange = ({ fieldName, newValue, dataElement, setDataElement }) => {
  setDataElement(
    produce(dataElement, (draft) => {
      draft[fieldName] = newValue;
    })
  );
};

const isComponentValid = ({ dataElement, setErrors }) => {
  const errors = {};

  if (!dataElement.name) {
    errors.name = true;
  }

  if (!dataElement.modulePath) {
    errors.modulePath = true;
  }

  setErrors(errors);
  return Object.keys(errors).length === 0;
};

const handleSave = async ({
  apiPromise,
  saveMethod,
  history,
  dataElement,
  setWaitingForExtensionResponse,
  setErrors
}) => {
  if (!isComponentValid({ dataElement, setErrors })) {
    return false;
  }

  setWaitingForExtensionResponse(true);

  try {
    const api = await apiPromise;
    const [isValid, settings] = await Promise.all([api.validate(), api.getSettings()]);

    if (isValid) {
      await saveMethod(
        produce(dataElement, (draft) => {
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

const computeDataElementList = (dataElements = {}) => {
  const componentList = {};
  const groupList = [];

  Object.values(dataElements).forEach((dataElement) => {
    if (!componentList[dataElement.extensionDisplayName]) {
      componentList[dataElement.extensionDisplayName] = [];
    }
    componentList[dataElement.extensionDisplayName].push({
      id: `${dataElement.extensionName}/${dataElement.libPath}`,
      name: dataElement.displayName
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
  const extensionDescriptor = useContext(ExtensionDescriptorContext);
  const dispatch = useDispatch();
  const history = useHistory();
  const { data_element_id: dataElementId } = useParams();

  const {
    dataElements,
    currentIframe,
    registry,
    extensions: extensionConfigurations
  } = useSelector((state) => state);

  const [waitingForExtensionResponse, setWaitingForExtensionResponse] = useState(false);
  const [errors, setErrors] = useState({});
  const [dataElement, setDataElement] = useState({});

  const dataElementsList = useMemo(() => computeDataElementList(registry.components.dataElements), [
    registry.components.dataElements
  ]);

  const saveMethod = useMemo(() => {
    const { addAndSaveToContainer, updateAndSaveToContainer } = dispatch.dataElements;
    return isNewDataElement({ dataElementId, dataElements })
      ? addAndSaveToContainer
      : updateAndSaveToContainer;
  }, [dispatch.dataElements, dataElementId, dataElements]);

  const componentIframeDetails = (registry.components.dataElements || {})[dataElement.modulePath];

  const extensionConfiguration = useMemo(() => {
    const extensionName = (dataElement.modulePath || '').split('/')[0];
    return extensionConfigurations.filter((i) => i.name === extensionName)[0];
  }, [dataElement.modulePath, extensionConfigurations]);

  useEffect(() => {
    setDataElement(getDataElement({ dataElementId, dataElements }));
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
          <Heading level={4}>Data Element Details</Heading>
          <TextField
            label="Name"
            isRequired
            width="size-3400"
            necessityIndicator="label"
            validationState={errors.name ? 'invalid' : ''}
            value={dataElement.name || ''}
            onChange={(newValue) =>
              handleInputChange({ fieldName: 'name', newValue, dataElement, setDataElement })
            }
          />

          <Picker
            marginTop="size-150"
            isRequired
            necessityIndicator="label"
            validationState={errors.modulePath ? 'invalid' : ''}
            label="Type"
            selectedKey={dataElement.modulePath || ''}
            onSelectionChange={(modulePath) =>
              handleComponentTypeChange({ modulePath, dataElement, setDataElement })
            }
            width="size-3400"
            items={dataElementsList}
          >
            {(item) => (
              <Section key={item.name} items={item.children} title={item.name}>
                {(subitem) => <Item>{subitem.name}</Item>}
              </Section>
            )}
          </Picker>

          <Checkbox
            marginTop="size-150"
            isSelected={dataElement.enableDefaultValue || false}
            onChange={(newValue) =>
              handleInputChange({
                fieldName: 'enableDefaultValue',
                newValue,
                dataElement,
                setDataElement
              })
            }
          >
            Enable default value
          </Checkbox>

          <br />

          {dataElement.enableDefaultValue && (
            <TextField
              label="Default Value"
              width="size-3400"
              value={dataElement.defaultValue || ''}
              onChange={(newValue) =>
                handleInputChange({
                  fieldName: 'defaultValue',
                  newValue,
                  dataElement,
                  setDataElement
                })
              }
            />
          )}

          <Checkbox
            marginTop="size-150"
            isSelected={dataElement.forceLowerCase || false}
            onChange={(newValue) =>
              handleInputChange({
                fieldName: 'forceLowerCase',
                newValue,
                dataElement,
                setDataElement
              })
            }
          >
            Force lower case
          </Checkbox>

          <br />

          <Checkbox
            marginTop="size-150"
            isSelected={dataElement.cleanText || false}
            onChange={(newValue) =>
              handleInputChange({
                fieldName: 'cleanText',
                newValue,
                dataElement,
                setDataElement
              })
            }
          >
            Clean Text
          </Checkbox>

          <br />

          {extensionDescriptor.platform !== 'edge' && (
            <Picker
              marginTop="size-150"
              label="Storage duration"
              selectedKey={dataElement.storageDuration || ''}
              onSelectionChange={(newValue) =>
                handleInputChange({
                  fieldName: 'storageDuration',
                  newValue,
                  dataElement,
                  setDataElement
                })
              }
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
          )}

          <ButtonGroup marginTop="size-250" marginBottom="size-150">
            <Button
              variant="cta"
              onPress={() =>
                handleSave({
                  saveMethod,
                  apiPromise: currentIframe.promise,
                  history,
                  dataElement,
                  setWaitingForExtensionResponse,
                  setErrors
                })
              }
            >
              Save
            </Button>

            <Button variant="secondary" onPress={() => history.push(backLink)}>
              Cancel
            </Button>
          </ButtonGroup>
        </View>

        <ComponentIframe
          component={componentIframeDetails}
          extensionConfiguration={extensionConfiguration}
          settings={dataElement.settings}
          server={registry.environment.server}
        />
      </Flex>
    </>
  );
};
