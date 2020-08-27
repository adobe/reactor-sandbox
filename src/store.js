import { init } from '@rematch/core';
import registry from './LibSandbox/rulesEditor/models/registry';
import currentIframe from './LibSandbox/rulesEditor/models/currentIframe';
import currentRule from './LibSandbox/rulesEditor/models/currentRule';
import rules from './LibSandbox/rulesEditor/models/rules';
import dataElements from './LibSandbox/rulesEditor/models/dataElements';
import propertySettings from './LibSandbox/rulesEditor/models/propertySettings';
import otherSettings from './LibSandbox/rulesEditor/models/otherSettings';
import extensionConfigurations from './LibSandbox/rulesEditor/models/extensionConfigurations';
// eslint-disable-next-line import/no-cycle
import brain from './LibSandbox/rulesEditor/models/brain';
import modals from './LibSandbox/rulesEditor/models/modals';

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
