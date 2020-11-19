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
import registry from './libSandbox/libraryEditor/models/registry';
import currentIframe from './libSandbox/libraryEditor/models/currentIframe';
import currentRule from './libSandbox/libraryEditor/models/currentRule';
import rules from './libSandbox/libraryEditor/models/rules';
import dataElements from './libSandbox/libraryEditor/models/dataElements';
import property from './libSandbox/libraryEditor/models/property';
import company from './libSandbox/libraryEditor/models/company';
import otherSettings from './libSandbox/libraryEditor/models/otherSettings';
import extensions from './libSandbox/libraryEditor/models/extensions';
// eslint-disable-next-line import/no-cycle
import brain from './libSandbox/libraryEditor/models/brain';
import modals from './libSandbox/libraryEditor/models/modals';

const store = init({
  models: {
    brain,
    rules,
    dataElements,
    extensions,
    registry,
    currentIframe,
    currentRule,
    property,
    company,
    otherSettings,
    modals
  }
});

export default store;
export const { dispatch } = store;
