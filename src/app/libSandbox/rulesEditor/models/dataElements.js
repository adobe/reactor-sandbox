import { List } from 'immutable';
import localStorage from './localStorage';

export default {
  state: List(), // initial state
  reducers: {
    setDataElements(state, payload) {
      const dataElements = payload
        .entrySeq()
        .map(([key, value]) => value.merge({ name: key }))
        .toList();

      localStorage.update('dataElements', dataElements);
      return dataElements;
    },
    addDataElement(state, payload) {
      const dataElements = state.push(payload.dataElement);
      localStorage.update('dataElements', dataElements);
      return dataElements;
    },
    saveDataElement(state, payload) {
      const dataElements = state.update(payload.id, () => payload.dataElement);
      localStorage.update('dataElements', dataElements);
      return dataElements;
    },
    deleteDataElement(state, payload) {
      const dataElements = state.delete(payload);
      localStorage.update('dataElements', dataElements);
      return dataElements;
    }
  }
};
