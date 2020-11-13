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
import {
  VALIDATE_LABEL_ASYNC,
  VALIDATION_SUCCESS,
  VALIDATION_ERROR,
  VALIDATE_LABEL_DEFAULT
} from '../../helpers/constants';
import logMessage from './logMessage';
import reportIframeComError from './reportIframeComError';

export default async ({
  setIsValidating,
  setValidationButtonLabel,
  setValidation,
  extensionView,
  selectedExtensionViewDescriptor
}) => {
  setIsValidating(true);

  const timeoutId = setTimeout(() => {
    setValidationButtonLabel(VALIDATE_LABEL_ASYNC);
  }, 500);

  const loadSchema = (uri) => fetch(uri).then((response) => response.json());

  try {
    const isValid = await extensionView.validate();

    const SCHEMA_REQUIRED_ERROR = 'Schema not defined in your extension.json but is required.';

    if (isValid) {
      if (selectedExtensionViewDescriptor?.schema) {
        const settings = await extensionView.getSettings();
        logMessage('getSettings() returned', settings);

        const ajv = Ajv({
          loadSchema,
          schemaId: 'auto'
        });
        // eslint-disable-next-line global-require
        ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'));

        const validateFunc = await ajv.compileAsync(selectedExtensionViewDescriptor.schema);
        const matchesSchema = validateFunc(settings);

        if (matchesSchema) {
          setValidation({ type: VALIDATION_SUCCESS, message: 'Valid' });
        } else {
          setValidation({
            type: VALIDATION_ERROR,
            message:
              'Settings object does not match schema. Ensure result of getSettings() ' +
              ' is correct.'
          });
        }
      } else {
        setValidation({
          type: VALIDATION_ERROR,
          message: SCHEMA_REQUIRED_ERROR
        });
      }
    } else {
      let message = 'View reported Invalid.';
      if (!selectedExtensionViewDescriptor?.schema) {
        message += ` ${SCHEMA_REQUIRED_ERROR}`;
      }
      setValidation({
        type: VALIDATION_ERROR,
        message
      });
    }
  } catch (e) {
    reportIframeComError(e);
  } finally {
    clearTimeout(timeoutId);
    setIsValidating(false);
    setValidationButtonLabel(VALIDATE_LABEL_DEFAULT);
  }
};
