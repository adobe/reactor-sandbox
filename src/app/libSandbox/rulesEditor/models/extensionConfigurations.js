import { List } from 'immutable';
import localStorage from './localStorage';

export default {
  state: List(), // initial state
  reducers: {
    setExtensionConfigurations(state, payload) {
      const extensionConfigurations = payload
        .entrySeq()
        .map(([key, value]) => value.merge({ name: key }))
        .toList();

      localStorage.update('extensions', extensionConfigurations);
      return extensionConfigurations;
    },
    addExtensionConfiguration(state, payload) {
      const extensionConfigurations = state.push(payload.extensionConfiguration);
      localStorage.update('extensions', extensionConfigurations);
      return extensionConfigurations;
    },
    saveExtensionConfiguration(state, payload) {
      const extensionConfigurations = state.update(
        payload.id,
        () => payload.extensionConfiguration
      );
      localStorage.update('extensions', extensionConfigurations);
      return extensionConfigurations;
    },
    deleteExtensionConfiguration(state, payload) {
      const extensionConfigurations = state.delete(payload);
      localStorage.update('extensions', extensionConfigurations);
      return extensionConfigurations;
    }
  }
};
