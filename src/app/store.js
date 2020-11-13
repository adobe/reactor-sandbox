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
