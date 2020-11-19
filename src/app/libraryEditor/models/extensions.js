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

/* eslint-disable no-param-reassign */

import { List, Map } from 'immutable';
import saveContainer from '../helpers/saveContainer';

const add = (list, payload) => {
  const extensionConfigurationIndex = list.findIndex(
    (i) => i.get('name') === payload.extensionConfiguration.get('name')
  );
  if (extensionConfigurationIndex !== -1) {
    return list.update(extensionConfigurationIndex, () => payload.extensionConfiguration);
  }
  return list.push(payload.extensionConfiguration);
};

const save = (list, payload) => list.update(payload.id, () => payload.extensionConfiguration);
const del = (list, payload) => list.delete(payload);

export default {
  state: List(), // initial state
  reducers: {
    setExtensionConfigurations(state, payload) {
      const extensionConfigurations = payload
        .entrySeq()
        .map(([key, value]) => value.merge({ name: key }))
        .toList();

      return extensionConfigurations;
    },
    addExtensionConfigurationReducer(state, payload) {
      const extensionConfigurations = add(state, payload);
      return extensionConfigurations;
    },
    saveExtensionConfigurationReducer(state, payload) {
      const extensionConfigurations = save(state, payload);
      return extensionConfigurations;
    },
    deleteExtensionConfigurationReducer(state, payload) {
      const extensionConfigurations = del(state, payload);
      return extensionConfigurations;
    }
  },
  effects: {
    async addExtensionConfiguration(payload, rootState) {
      const extensionConfigurations = add(rootState.extensions, payload);

      let clonedState = Map(rootState);
      clonedState = clonedState.set('extensions', extensionConfigurations);
      return saveContainer(clonedState.toJS()).then(() =>
        this.addExtensionConfigurationReducer(payload)
      );
    },

    async saveExtensionConfiguration(payload, rootState) {
      const extensionConfigurations = save(rootState.extensions, payload);

      let clonedState = Map(rootState);
      clonedState = clonedState.set('extensions', extensionConfigurations);

      return saveContainer(clonedState.toJS()).then(() =>
        this.saveExtensionConfigurationReducer(payload)
      );
    },

    async deleteExtensionConfiguration(payload, rootState) {
      const extensionConfigurations = del(rootState.extensions, payload);

      let clonedState = Map(rootState);
      clonedState = clonedState.set('extensions', extensionConfigurations);

      return saveContainer(clonedState.toJS()).then(() =>
        this.deleteExtensionConfigurationReducer(payload)
      );
    }
  }
};
