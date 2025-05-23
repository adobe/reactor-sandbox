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

import produce from 'immer';

import saveContainer from '../helpers/saveContainer';

const add = (list, payload) =>
  produce([list, payload], ([extensionConfigurations, { name, displayName, settings }]) => {
    let extensionConfigurationIndex = -1;
    for (let i = 0; i < extensionConfigurations.length; i += 1) {
      if (extensionConfigurations[i].name === name) {
        extensionConfigurationIndex = i;
      }
    }

    if (extensionConfigurationIndex !== -1) {
      extensionConfigurations[extensionConfigurationIndex] = { name, displayName, settings };
    } else {
      extensionConfigurations.push({ name, displayName, settings });
    }
  });

const update = (list, payload) =>
  produce([list, payload], ([extensionConfigurations, { id, name, displayName, settings }]) => {
    extensionConfigurations[id] = { name, displayName, settings };
  });

const del = (list, payload) =>
  produce([list, payload], ([extensionConfigurations, id]) => {
    // eslint-disable-next-line no-unused-vars
    extensionConfigurations = extensionConfigurations.splice(id, 1);
  });

const cloneState = produce((draft, extensionConfigurations) => {
  draft.extensions = extensionConfigurations;
});

export default {
  state: [], // initial state
  reducers: {
    set(state, payload) {
      return produce(payload, (draft) =>
        Object.keys(draft).reduce((accumulator, key) => {
          accumulator.push({
            ...draft[key],
            name: key
          });

          return accumulator;
        }, [])
      );
    },
    add(state, payload) {
      const [extensionConfigurations] = add(state, payload);
      return extensionConfigurations;
    },
    update(state, payload) {
      const [extensionConfigurations] = update(state, payload);
      return extensionConfigurations;
    },
    delete(state, payload) {
      const [extensionConfigurations] = del(state, payload);
      return extensionConfigurations;
    }
  },
  effects: {
    async addAndSaveToContainer(payload, rootState) {
      const [extensionConfigurations] = add(rootState.extensions, payload);
      const clonedState = cloneState(rootState, extensionConfigurations);

      await saveContainer(clonedState);
      return this.add(payload);
    },

    async updateAndSaveToContainer(payload, rootState) {
      const [extensionConfigurations] = update(rootState.extensions, payload);
      const clonedState = cloneState(rootState, extensionConfigurations);

      await saveContainer(clonedState);
      return this.update(payload);
    },

    async deleteAndSaveContainer(payload, rootState) {
      const [extensionConfigurations] = del(rootState.extensions, payload);
      const clonedState = cloneState(rootState, extensionConfigurations);

      await saveContainer(clonedState);
      return this.delete(payload);
    }
  }
};
