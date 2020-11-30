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
import { Map, List } from 'immutable';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
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

const isNewComponent = ({ dataElementId, dataElements }) => {
  return dataElementId === 'new' || dataElementId >= (dataElements || List()).size;
};

const getDataElement = ({ dataElementId, dataElements }) =>
  (dataElements || List()).get(dataElementId) ||
  Map({
    modulePath: '',
    settings: null
  });

const backLink = `${NAMED_ROUTES.LIBRARY_EDITOR}/data_elements/`;

const handleComponentTypeChange = ({ modulePath, dataElement, setDataElement }) => {
  setDataElement(
    dataElement.merge({
      settings: null,
      modulePath
    })
  );
};

const handleInputChange = ({ fieldName, newValue, dataElement, setDataElement }) => {
  const newDataElement = dataElement.set(fieldName, newValue);
  setDataElement(newDataElement);
};

const isComponentValid = ({ dataElement, currentIframe, setErrors }) => {
  const errors = {};

  if (!dataElement.get('name')) {
    errors.name = true;
  }

  if (!dataElement.get('modulePath') || !currentIframe.promise) {
    errors.modulePath = true;
  }

  setErrors(errors);
  return Object.keys(errors).length === 0;
};

const handleSave = ({
  dispatch: {
    dataElements: { saveDataElement, addDataElement }
  },
  currentIframe,
  history,
  dataElementId,
  dataElement,
  dataElements,
  setWaitingForExtensionResponse,
  setErrors
}) => {
  if (!isComponentValid({ dataElement, currentIframe, setErrors })) {
    return false;
  }

  const method = isNewComponent({ dataElementId, dataElements }) ? addDataElement : saveDataElement;

  setWaitingForExtensionResponse(true);

  currentIframe.promise
    .then((api) => Promise.all([api.validate(), api.getSettings()]))
    .then(([isValid, settings]) => {
      if (isValid) {
        method({
          id: dataElementId,
          dataElement: dataElement.merge({ settings })
        });

        history.push(backLink);
      } else {
        setWaitingForExtensionResponse(false);
      }
    });

  return true;
};

const dataElementsList = ({ registry }) => {
  const componentList = {};
  const groupList = [];

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
};

export default () => {
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
  const [dataElement, setDataElement] = useState(Map());

  const componentIframeDetails = registry.getIn([
    'components',
    'dataElements',
    dataElement.get('modulePath')
  ]);

  const extensionName = (dataElement.get('modulePath') || '').split('/')[0];

  useEffect(() => {
    setDataElement(getDataElement({ dataElementId, dataElements }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
            selectedKey={dataElement.get('modulePath') || ''}
            onSelectionChange={(modulePath) =>
              handleComponentTypeChange({ modulePath, dataElement, setDataElement })
            }
            width="size-3400"
            items={dataElementsList({ registry })}
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
            onChange={(newValue) =>
              handleInputChange({
                fieldName: 'defaultValue',
                newValue,
                dataElement,
                setDataElement
              })
            }
          />

          <Checkbox
            marginTop="size-150"
            isSelected={dataElement.get('forceLowerCase') || false}
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
            isSelected={dataElement.get('cleanText') || false}
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

          <Picker
            marginTop="size-150"
            label="Storage duration"
            selectedKey={dataElement.get('storageDuration') || ''}
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

          <ButtonGroup marginTop="size-150" marginBottom="size-150">
            <Button
              variant="cta"
              onPress={() =>
                handleSave({
                  dispatch,
                  currentIframe,
                  history,
                  dataElementId,
                  dataElement,
                  dataElements,
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
          extensionConfiguration={extensionConfigurations
            .filter((i) => i.get('name') === extensionName)
            .first()}
          settings={dataElement.get('settings')}
          server={registry.getIn(['environment', 'server'])}
        />
      </Flex>
    </>
  );
};
