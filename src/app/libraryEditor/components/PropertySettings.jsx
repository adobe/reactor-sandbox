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

import React, { useContext, useState } from 'react';
import produce from 'immer';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { View, Heading, Divider, TextField, Button, Flex } from '@adobe/react-spectrum';
import { NAMED_ROUTES } from '../../constants';
import { PLATFORMS } from '../../../helpers/sharedConstants';
import ErrorMessage from '../../components/ErrorMessage';
import ExtensionDescriptorContext from '../../extensionDescriptorContext';

const isValid = ({ domains, propertyId, setErrors, platform }) => {
  const errors = {};

  if (platform !== PLATFORMS.EDGE && !domains) {
    errors.domains = true;
  }

  if (!propertyId) {
    errors.propertyId = true;
  }

  setErrors(errors);
  return Object.keys(errors).length === 0;
};

const handleSave = async ({
  domains,
  platform,
  propertyId,
  setErrors,
  history,
  propertySettings,
  savePropertySettings
}) => {
  if (!isValid({ domains, propertyId, setErrors, platform })) {
    return false;
  }

  try {
    await savePropertySettings(
      produce(propertySettings, (draft) => {
        draft.settings.domains = domains.split(',').map((s) => s.trim());
        draft.settings.id = propertyId;
      })
    );
    history.push(NAMED_ROUTES.LIBRARY_EDITOR);
  } catch (e) {
    setErrors({ api: e.message });
  }

  return true;
};

export default () => {
  const dispatch = useDispatch();
  const history = useHistory();

  const propertySettings = useSelector((state) => state.property);
  const [errors, setErrors] = useState({});
  const [domains, setDomains] = useState((propertySettings.settings.domains || []).join(', '));
  const [propertyId, setPropertyId] = useState(propertySettings.settings.id);
  const { platform } = useContext(ExtensionDescriptorContext);

  return errors.api ? (
    <View flex>
      <ErrorMessage message={errors.api} />
    </View>
  ) : (
    <View padding="size-200" flex>
      <View margin="2rem auto" maxWidth="50rem">
        <Heading level={2}>Propertys Settings</Heading>
        <Divider />

        <Flex direction="column" alignItems="center">
          <TextField
            label="Property ID"
            necessityIndicator="label"
            isRequired
            width="size-6000"
            marginTop="size-150"
            validationState={errors.propertyId ? 'invalid' : ''}
            value={propertyId}
            onChange={setPropertyId}
          />

          {platform !== PLATFORMS.EDGE && (
            <>
              <TextField
                label="Domains List"
                necessityIndicator="label"
                isRequired
                width="size-6000"
                marginTop="size-150"
                validationState={errors.domains ? 'invalid' : ''}
                value={domains}
                onChange={setDomains}
              />

              <Heading level={6} margin="size-100" width="size-6000">
                Comma separated values are accepted.
              </Heading>
            </>
          )}

          <View marginTop="size-400" alignItems="left" width="size-6000">
            <Button
              variant="cta"
              onPress={() => {
                handleSave({
                  domains,
                  propertyId,
                  setErrors,
                  history,
                  platform,
                  propertySettings,
                  savePropertySettings: dispatch.property.savePropertySettings
                });
              }}
            >
              Save
            </Button>
          </View>
        </Flex>
      </View>
    </View>
  );
};
