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

import produce from 'immer';
import saveContainer from '../helpers/saveContainer';

const add = (list, payload) =>
  produce([list, payload], ([rules, rule]) => {
    delete rule.ruleId;
    rules.push(rule);
  });

const update = (list, payload) =>
  produce([list, payload], ([rules, { ruleId, ...rule }]) => {
    delete rule.ruleId;
    rules[ruleId] = rule;
  });

const del = (list, payload) =>
  produce([list, payload], ([rules, id]) => {
    // eslint-disable-next-line no-unused-vars
    rules = rules.splice(id, 1);
  });

const cloneState = produce((draft, rules) => {
  draft.rules = rules;
});

export default {
  state: [], // initial state
  reducers: {
    set(state, payload) {
      return payload;
    },
    add(state, payload) {
      const [rules] = add(state, payload);
      return rules;
    },
    update(state, payload) {
      const [rules] = update(state, payload);
      return rules;
    },
    delete(state, payload) {
      const [rules] = del(state, payload);
      return rules;
    }
  },
  effects: {
    async addAndSaveToContainer(payload, rootState) {
      const [rules] = add(rootState.rules, payload);
      const clonedState = cloneState(rootState, rules);

      await saveContainer(clonedState);
      return this.add(payload);
    },

    async updateAndSaveToContainer(payload, rootState) {
      const [rules] = update(rootState.rules, payload);
      const clonedState = cloneState(rootState, rules);

      await saveContainer(clonedState);
      return this.update(payload);
    },

    async deleteAndSaveContainer(payload, rootState) {
      const [rules] = del(rootState.rules, payload);
      const clonedState = cloneState(rootState, rules);

      await saveContainer(clonedState);
      return this.delete(payload);
    }
  }
};
