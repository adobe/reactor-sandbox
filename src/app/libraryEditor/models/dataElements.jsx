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
  produce([list, payload], ([dataElements, { id, enableDefaultValue, ...dataElement }]) => {
    let dataElementIndex = -1;
    for (let i = 0; i < dataElements.length; i += 1) {
      if (dataElements[i].name === dataElement.name) {
        dataElementIndex = i;
      }
    }

    if (!enableDefaultValue) {
      delete dataElement.defaultValue;
    }

    if (dataElementIndex !== -1) {
      dataElements[dataElementIndex] = dataElement;
    } else {
      dataElements.push(dataElement);
    }
  });

const update = (list, payload) =>
  produce([list, payload], ([dataElements, { id, enableDefaultValue, ...dataElement }]) => {
    if (!enableDefaultValue) {
      delete dataElement.defaultValue;
    }

    dataElements[id] = dataElement;
  });

const del = (list, payload) =>
  produce([list, payload], ([dataElements, id]) => {
    // eslint-disable-next-line no-unused-vars
    dataElements = dataElements.splice(id, 1);
  });

const cloneState = produce((draft, dataElements) => {
  draft.dataElements = dataElements;
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
      const [dataElements] = add(state, payload);
      return dataElements;
    },
    update(state, payload) {
      const [dataElements] = update(state, payload);
      return dataElements;
    },
    delete(state, payload) {
      const [dataElements] = del(state, payload);
      return dataElements;
    }
  },
  effects: {
    async addAndSaveToContainer(payload, rootState) {
      const [dataElements] = add(rootState.dataElements, payload);
      const clonedState = cloneState(rootState, dataElements);

      await saveContainer(clonedState);
      return this.add(payload);
    },

    async updateAndSaveToContainer(payload, rootState) {
      const [dataElements] = update(rootState.dataElements, payload);
      const clonedState = cloneState(rootState, dataElements);

      await saveContainer(clonedState);
      return this.update(payload);
    },

    async deleteAndSaveContainer(payload, rootState) {
      const [dataElements] = del(rootState.dataElements, payload);
      const clonedState = cloneState(rootState, dataElements);

      await saveContainer(clonedState);
      return this.delete(payload);
    }
  }
};
