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
