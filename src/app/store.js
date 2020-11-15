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

import { init } from '@rematch/core';
import registry from './libSandbox/rulesEditor/models/registry';
import currentIframe from './libSandbox/rulesEditor/models/currentIframe';
import currentRule from './libSandbox/rulesEditor/models/currentRule';
import rules from './libSandbox/rulesEditor/models/rules';
import dataElements from './libSandbox/rulesEditor/models/dataElements';
import propertySettings from './libSandbox/rulesEditor/models/propertySettings';
import otherSettings from './libSandbox/rulesEditor/models/otherSettings';
import extensionConfigurations from './libSandbox/rulesEditor/models/extensionConfigurations';
// eslint-disable-next-line import/no-cycle
import brain from './libSandbox/rulesEditor/models/brain';
import modals from './libSandbox/rulesEditor/models/modals';

const store = init({
  models: {
    brain,
    rules,
    dataElements,
    extensionConfigurations,
    registry,
    currentIframe,
    currentRule,
    propertySettings,
    otherSettings,
    modals
  }
});

export default store;
export const { dispatch } = store;
