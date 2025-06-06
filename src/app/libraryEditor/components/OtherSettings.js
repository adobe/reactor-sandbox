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

import React, { useState } from 'react';
import produce from 'immer';
import { useDispatch, useSelector } from 'react-redux';
import { View, Heading, Divider, TextField, Button, Flex } from '@adobe/react-spectrum';
import { useHistory } from 'react-router-dom';
import { NAMED_ROUTES } from '../../constants';
import ErrorMessage from '../../components/ErrorMessage';

const handleCompanySettingChange = ({
  settingKey,
  settingValue,
  setCompanySettings,
  companySettings
}) => {
  setCompanySettings(
    produce(companySettings, (draft) => {
      draft[settingKey] = settingValue;
    })
  );
};

const handleImsChange = ({ imsAccess, otherSettings, setOtherSettings }) => {
  setOtherSettings(
    produce(otherSettings, (draft) => {
      draft.tokens.imsAccess = imsAccess;
    })
  );
};

const handleReactorApiEndpointChange = ({
  reactorApiEndpoint,
  otherSettings,
  setOtherSettings
}) => {
  setOtherSettings(
    produce(otherSettings, (draft) => {
      draft.apiEndpoints.reactor = reactorApiEndpoint;
    })
  );
};

const isValid = ({ companySettings, otherSettings, setErrors }) => {
  const errors = {};

  if (!companySettings.id) {
    errors.id = true;
  }

  if (!companySettings.orgId) {
    errors.orgId = true;
  }

  if (!otherSettings.tokens?.imsAccess) {
    errors.imsAccess = true;
  }

  if (!otherSettings.apiEndpoints?.reactor) {
    errors.reactorApiEndpoint = true;
  }

  setErrors(errors);
  return Object.keys(errors).length === 0;
};

const handleSave = async ({
  companySettings,
  otherSettings,
  setErrors,
  history,
  saveCompanySettings,
  saveOtherSettings
}) => {
  if (!isValid({ companySettings, otherSettings, setErrors })) {
    return false;
  }

  try {
    await Promise.all([saveCompanySettings(companySettings), saveOtherSettings(otherSettings)]);
    history.push(NAMED_ROUTES.LIBRARY_EDITOR);
  } catch (e) {
    setErrors({ api: e.message });
    throw e;
  }

  return true;
};

export default () => {
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const history = useHistory();

  const [companySettings, setCompanySettings] = useState(useSelector((state) => state.company));
  const [otherSettings, setOtherSettings] = useState(useSelector((state) => state.otherSettings));

  return errors.api ? (
    <View flex>
      <ErrorMessage message={errors.api} />
    </View>
  ) : (
    <Flex direction="column">
      <View width="100%" alignSelf="center">
        <Heading level={2}>Company Settings</Heading>
        <Divider />
        <Flex direction="column" alignItems="center">
          <TextField
            label="Company ID"
            width="size-6000"
            marginTop="size-150"
            validationState={errors.id ? 'invalid' : ''}
            value={companySettings.id || ''}
            onChange={(id) => {
              handleCompanySettingChange({
                settingKey: 'id',
                settingValue: id,
                companySettings,
                setCompanySettings
              });
            }}
          />
          <TextField
            label="Organization ID"
            necessityIndicator="label"
            isRequired
            width="size-6000"
            marginTop="size-150"
            validationState={errors.orgId ? 'invalid' : ''}
            value={companySettings.orgId || ''}
            onChange={(orgId) => {
              handleCompanySettingChange({
                settingKey: 'orgId',
                settingValue: orgId,
                companySettings,
                setCompanySettings
              });
            }}
          />
        </Flex>

        <Heading level={2} marginTop="size-400">
          IMS Token Settings
        </Heading>
        <Divider />
        <Flex direction="column" alignItems="center">
          <View>
            <TextField
              label="IMS Token"
              necessityIndicator="label"
              isRequired
              width="size-6000"
              marginTop="size-150"
              validationState={errors.imsAccess ? 'invalid' : ''}
              value={otherSettings?.tokens?.imsAccess || ''}
              onChange={(imsAccess) => {
                handleImsChange({ imsAccess, otherSettings, setOtherSettings });
              }}
            />
          </View>
        </Flex>

        <Heading level={2} marginTop="size-400">
          API Endpoints
        </Heading>
        <Divider />
        <Flex direction="column" alignItems="center">
          <View>
            <TextField
              label="Reactor API Endpoint"
              necessityIndicator="label"
              isRequired
              width="size-6000"
              marginTop="size-150"
              validationState={errors.reactorApiEndpoint ? 'invalid' : ''}
              value={otherSettings?.apiEndpoints?.reactor || ''}
              onChange={(reactorApiEndpoint) => {
                handleReactorApiEndpointChange({
                  reactorApiEndpoint,
                  otherSettings,
                  setOtherSettings
                });
              }}
            />
            <br />
            <Button
              variant="cta"
              marginTop="size-400"
              onPress={() => {
                handleSave({
                  companySettings,
                  otherSettings,
                  setErrors,
                  history,
                  saveCompanySettings: dispatch.company.saveCompanySettings,
                  saveOtherSettings: dispatch.otherSettings.saveOtherSettings
                });
              }}
            >
              Save
            </Button>
          </View>
        </Flex>
      </View>
    </Flex>
  );
};
