import { Map } from 'immutable';
import localStorage from './localStorage';

export default {
  state: Map(), // initial state
  reducers: {
    setPropertySettings(state, payload) {
      localStorage.update('property', Map().set('settings', payload));
      return payload;
    }
  }
};
