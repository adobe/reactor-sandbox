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

import Ajv from 'ajv';
import React, { useState } from 'react';
import { Button, Text, Flex, View } from '@adobe/react-spectrum';
import Checkmark from '@spectrum-icons/workflow/Checkmark';
import Alert from '@spectrum-icons/workflow/Alert';
import reportFatalError from './helpers/reportFatalError';
import { LOG_PREFIX } from './helpers/constants';

const loadSchema = (uri) => fetch(uri).then((response) => response.json());

const onValidatePress = ({ extensionBridge, setValidationState, descriptor }) => {
  if (extensionBridge) {
    extensionBridge.promise.then((api) => {
      Promise.all([api.validate(), api.getSettings()])
        .then(([validationResult, settings]) => {
          // eslint-disable-next-line no-console
          console.log(`${LOG_PREFIX} validate() returned`, validationResult);

          // eslint-disable-next-line no-console
          console.log(`${LOG_PREFIX} getSettings() returned`, settings);

          if (validationResult === true) {
            const ajv = Ajv({
              loadSchema,
              schemaId: 'auto'
            });
            // eslint-disable-next-line global-require
            ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'));

            return ajv.compileAsync(descriptor.schema).then((validate) => {
              const matchesSchema = validate(settings);

              if (matchesSchema) {
                setValidationState(true);
              } else {
                setValidationState(
                  'Settings object does not match schema. ' +
                    'Ensure result of getSettings() is correct.'
                );
              }
            });
          }

          setValidationState(validationResult);
          return null;
        })
        .catch(reportFatalError);
    });
  }
};

export default ({ extensionBridge, selectedDescriptor: { descriptor } }) => {
  const [validationState, setValidationState] = useState(null);
  return (
    <Flex direction="column" alignItems="left">
      <div>
        <Button
          variant="cta"
          onPress={() => onValidatePress({ extensionBridge, descriptor, setValidationState })}
          margin="size-200"
        >
          Validate
        </Button>
      </div>

      {validationState === true && (
        <View
          borderWidth="thin"
          borderColor="dark"
          borderRadius="medium"
          padding="size-250"
          margin="size-200"
        >
          <Flex direction="row" gap="size-50">
            <Checkmark color="positive" />
            <Text marginStart="size-100">Validation Result: true</Text>
          </Flex>
        </View>
      )}

      {validationState === false && (
        <View
          borderWidth="thin"
          borderColor="dark"
          borderRadius="medium"
          padding="size-250"
          margin="size-200"
        >
          <Flex direction="row" gap="size-50">
            <Alert color="negative" />
            <Text marginStart="size-100">Validation Result: false</Text>
          </Flex>
        </View>
      )}

      {validationState && typeof validationState !== 'boolean' && (
        <View
          borderWidth="thin"
          borderColor="dark"
          borderRadius="medium"
          padding="size-250"
          margin="size-200"
        >
          <Flex direction="row" gap="size-50">
            <Alert color="negative" />
            <Text marginStart="size-100">{validationState}</Text>
          </Flex>
        </View>
      )}
    </Flex>
  );
};
