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
import { getEditorRegistry, getContainerData } from '../../api/index';
import localStorage from './localStorage';
import saveContainer from '../helpers/saveContainer';

// eslint-disable-next-line import/no-cycle
import { dispatch } from '../../store';

const loadOtherSettings = (extensionName) => {
  localStorage.loadStateFor(extensionName);

  if (!localStorage.get('otherSettings')) {
    localStorage.update('otherSettings', {
      tokens: {
        imsAccess: 'fake-ims-access-token'
      }
    });
  }

  dispatch.otherSettings.setOtherSettings(localStorage.get('otherSettings'));
};

export default {
  state: {}, // initial state

  reducers: {
    setError(baseState, error) {
      return produce(baseState, (draftState) => {
        draftState.error = error;
      });
    },
    setContainerDataReseted(baseState, payload) {
      return produce(baseState, (draftState) => {
        draftState.containerDataReseted = payload;
      });
    },
    setInitialized(baseState, payload) {
      return produce(baseState, (draftState) => {
        draftState.initialized = payload;
      });
    },
    setExtensionName(baseState, payload) {
      return produce(baseState, (draftState) => {
        draftState.extensionName = payload;
      });
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

      dispatch.registry.setRegistry(
        produce(data, (draftState) => {
          delete draftState.currentExtensionName;
        })
      );

      this.setExtensionName(data.currentExtensionName);
      loadOtherSettings(data.currentExtensionName);
    },

    async loadContainerData() {
      const containerData = await getContainerData();
      this.pushDataDown(containerData);
    },

    async clearContainerData() {
      const emptyContainerData = {
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
      };

      await this.pushDataDown(emptyContainerData);
      await saveContainer(emptyContainerData);

      this.setContainerDataReseted('success');
    },

    async clearLocalStorage(_, rootState) {
      localStorage.delete();
      loadOtherSettings(rootState.brain.extensionName);
    },

    async pushDataDown(payload) {
      dispatch.extensions.set(payload.extensions);
      dispatch.rules.set(payload.rules);
      dispatch.dataElements.set(payload.dataElements);

      dispatch.property.setPropertySettings(payload.property);
      dispatch.company.setCompanySettings(payload.company);
    }
  }
};
