import { fromJS, Map } from 'immutable';
import environment from './environment';
import localStorage from './localStorage';
// eslint-disable-next-line import/no-cycle
import { dispatch } from '../../../store';

const host = `${environment.server.host}:${environment.server.port}`;

export default {
  state: Map(), // initial state
  reducers: {
    setContainerDataLoaded(state, payload) {
      return state.set('containerDataLoaded', payload);
    },
    setContainerDataReseted(state, payload) {
      return state.set('containerDataReseted', payload);
    },
    setInitialized(state, payload) {
      return state.set('initialized', payload);
    }
  },
  effects: {
    async initialize() {
      const response = await fetch(`${host}/editor-registry.js`);

      if (response.ok) {
        const data = await response.json();
        const jsData = fromJS(data);

        dispatch.registry.setRegistry(jsData.delete('currentExtensionName'));
        localStorage.loadStateFor(jsData.get('currentExtensionName'));

        this.pushDataDown(localStorage.get());

        setTimeout(() => {
          this.setInitialized(true);
        }, 0);
      }
    },

    async loadContainerData() {
      const response = await fetch(`${host}/editor-container.js`);

      if (response.ok) {
        const containerData = await response.json();
        this.pushDataDown(Map(containerData));
        this.setContainerDataLoaded('success');
      } else {
        this.setContainerDataLoaded('failed');
      }
    },

    clearContainerData() {
      this.pushDataDown(
        Map({
          extensions: [],
          rules: [],
          dataElements: [],
          property: { settings: {} }
        })
      );

      this.setContainerDataReseted('success');
    },

    pushDataDown(payload) {
      dispatch.extensionConfigurations.setExtensionConfigurations(
        fromJS(payload.get('extensions'))
      );
      dispatch.rules.setRules(fromJS(payload.get('rules')));
      dispatch.dataElements.setDataElements(fromJS(payload.get('dataElements')));

      dispatch.propertySettings.setPropertySettings(
        fromJS(
          payload.getIn(['property', 'settings']) || {
            domains: ['example.com']
          }
        )
      );
      dispatch.otherSettings.setOtherSettings(
        fromJS(
          payload.get('otherSettings') || {
            company: {
              orgId: 'ABCDEFGHIJKLMNOPQRSTUVWX@AdobeOrg'
            },
            tokens: {
              imsAccess: 'fake-ims-access-token'
            }
          }
        )
      );
    },

    async save() {
      const localStorageData = localStorage.get();
      const containerData = localStorageData
        .setIn(['company', 'orgId'], localStorageData.get('otherSettings').company.orgId)
        .delete('otherSettings');

      const response = await fetch(`${host}/editor-container.js`, {
        method: 'POST',
        cache: 'no-cache',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(containerData)
      });

      if (response.ok) {
        window.location = '/libSandbox';
      } else {
        // eslint-disable-next-line no-alert
        alert('Something went bad!');
      }
    }
  }
};
