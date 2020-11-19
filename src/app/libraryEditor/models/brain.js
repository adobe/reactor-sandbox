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

import { fromJS, Map } from 'immutable';
import { getEditorRegistry, getContainerData } from '../../api/index';
import localStorage from './localStorage';
import saveContainer from '../helpers/saveContainer';

// eslint-disable-next-line import/no-cycle
import { dispatch } from '../../store';

const loadOtherSettings = (extensionName) => {
  localStorage.loadStateFor(extensionName);

  if (!localStorage.get('otherSettings')) {
    localStorage.update(
      'otherSettings',
      fromJS({
        tokens: {
          imsAccess: 'fake-ims-access-token'
        }
      })
    );
  }

  dispatch.otherSettings.setOtherSettings(localStorage.get('otherSettings'));
};

export default {
  state: Map(), // initial state
  reducers: {
    setError(state, error) {
      return state.set('error', error);
    },
    setContainerDataReseted(state, payload) {
      return state.set('containerDataReseted', payload);
    },
    setInitialized(state, payload) {
      return state.set('initialized', payload);
    },
    setExtensionName(state, payload) {
      return state.set('extensionName', payload);
    }
  },
  effects: {
    initialize() {
      Promise.all([
        this.loadRegistryData(),
        this.loadContainerData().catch(() => {
          this.clearContainerData();
        })
      ])
        .then(() => {
          this.setInitialized(true);
        })
        .catch((e) => this.setError(e));
    },

    async loadRegistryData() {
      const data = await getEditorRegistry();
      const jsData = fromJS(data);

      dispatch.registry.setRegistry(jsData.delete('currentExtensionName'));
      this.setExtensionName(jsData.get('currentExtensionName'));
      loadOtherSettings(jsData.get('currentExtensionName'));
    },

    async loadContainerData() {
      const containerData = await getContainerData();
      this.pushDataDown(fromJS(containerData));
    },

    async clearContainerData() {
      const emptyContainerData = fromJS({
        extensions: [],
        rules: [],
        dataElements: [],
        property: {
          settings: {
            domains: ['example.com'],
            linkDelay: 100,
            trackingCookieName: 'sat_track',
            undefinedVarsReturnEmpty: false
          }
        },
        company: {
          orgId: 'ABCDEFGHIJKLMNOPQRSTUVWX@AdobeOrg'
        }
      });

      await this.pushDataDown(emptyContainerData);
      await saveContainer(emptyContainerData.toJS());

      this.setContainerDataReseted('success');
    },

    async clearLocalStorage(_, rootState) {
      localStorage.delete();
      loadOtherSettings(rootState.brain.get('extensionName'));
    },

    async pushDataDown(payload) {
      dispatch.extensions.setExtensionConfigurations(payload.get('extensions'));
      dispatch.rules.setRules(payload.get('rules'));
      dispatch.dataElements.setDataElements(payload.get('dataElements'));

      dispatch.property.setPropertySettings(payload.get('property'));
      dispatch.company.setCompanySettings(payload.get('company'));
    }
  }
};
