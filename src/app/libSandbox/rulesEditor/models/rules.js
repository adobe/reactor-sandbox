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

import { List } from 'immutable';
import localStorage from './localStorage';

export default {
  state: List(), // initial state
  reducers: {
    setRules(state, payload) {
      localStorage.update('rules', payload);
      return payload;
    },
    addRule(state, payload) {
      const rules = state.push(payload.rule.set('id', `RL${Date.now()}`));
      localStorage.update('rules', rules);
      return rules;
    },
    saveRule(state, payload) {
      const rules = state.update(payload.id, () => payload.rule.set('id', `RL${Date.now()}`));
      localStorage.update('rules', rules);
      return rules;
    },
    deleteRule(state, payload) {
      const rules = state.delete(payload);
      localStorage.update('rules', rules);
      return rules;
    }
  }
};
