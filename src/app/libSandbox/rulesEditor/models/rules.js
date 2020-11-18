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
  return list.push(payload.rule.set('id', `RL${Date.now()}`));
};

const save = (list, payload) =>
  list.update(payload.id, () => payload.rule.set('id', `RL${Date.now()}`));
const del = (list, payload) => list.delete(payload);

export default {
  state: List(), // initial state
  reducers: {
    setRules(state, payload) {
      return payload;
    },
    addRuleReducer(state, payload) {
      const rules = add(state, payload);
      return rules;
    },
    saveRuleReducer(state, payload) {
      const rules = save(state, payload);
      return rules;
    },
    deleteRuleReducer(state, payload) {
      const rules = del(state, payload);
      return rules;
    }
  },
  effects: {
    async addRule(payload, rootState) {
      const rules = add(rootState.rules, payload);

      let clonedState = Map(rootState);
      clonedState = clonedState.set('rules', rules);
      return saveContainer(clonedState.toJS()).then(() => this.addRuleReducer(payload));
    },

    async saveRule(payload, rootState) {
      const rules = save(rootState.rules, payload);

      let clonedState = Map(rootState);
      clonedState = clonedState.set('rules', rules);

      return saveContainer(clonedState.toJS()).then(() => this.saveRuleReducer(payload));
    },

    async deleteRule(payload, rootState) {
      const rules = del(rootState.rules, payload);

      let clonedState = Map(rootState);
      clonedState = clonedState.set('rules', rules);

      return saveContainer(clonedState.toJS()).then(() => this.deleteRuleReducer(payload));
    }
  }
};
