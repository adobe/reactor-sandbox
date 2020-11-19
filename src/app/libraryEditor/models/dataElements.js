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
  const index = list.findIndex((i) => i.get('name') === payload.dataElement.get('name'));
  if (index !== -1) {
    return list.update(index, () => payload.dataElement);
  }
  return list.push(payload.dataElement);
};

const save = (list, payload) => list.update(payload.id, () => payload.dataElement);
const del = (list, payload) => list.delete(payload);

export default {
  state: List(), // initial state
  reducers: {
    setDataElements(state, payload) {
      const dataElements = payload
        .entrySeq()
        .map(([key, value]) => value.merge({ name: key }))
        .toList();

      return dataElements;
    },
    addDataElementReducer(state, payload) {
      const dataElements = add(state, payload);
      return dataElements;
    },
    saveDataElementReducer(state, payload) {
      const dataElements = save(state, payload);
      return dataElements;
    },
    deleteDataElementReducer(state, payload) {
      const dataElements = del(state, payload);
      return dataElements;
    }
  },
  effects: {
    async addDataElement(payload, rootState) {
      const dataElements = add(rootState.dataElements, payload);

      let clonedState = Map(rootState);
      clonedState = clonedState.set('dataElements', dataElements);
      return saveContainer(clonedState.toJS()).then(() => this.addDataElementReducer(payload));
    },

    async saveDataElement(payload, rootState) {
      const dataElements = save(rootState.dataElements, payload);

      let clonedState = Map(rootState);
      clonedState = clonedState.set('dataElements', dataElements);

      return saveContainer(clonedState.toJS()).then(() => this.saveDataElementReducer(payload));
    },

    async deleteDataElement(payload, rootState) {
      const dataElements = del(rootState.dataElements, payload);

      let clonedState = Map(rootState);
      clonedState = clonedState.set('dataElements', dataElements);

      return saveContainer(clonedState.toJS()).then(() => this.deleteDataElementReducer(payload));
    }
  }
};
