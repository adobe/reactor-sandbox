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

const cloneState = produce((draft, propertySettings) => {
  draft.property = propertySettings;
});

export default {
  state: {}, // initial state
  reducers: {
    setPropertySettings(state, payload) {
      return payload;
    }
  },
  effects: {
    async savePropertySettings(payload, rootState) {
      const propertySettings = produce(payload, (draft) => {
        draft.settings.linkDelay = 100;
        draft.settings.trackingCookieName = 'sat_track';
        draft.settings.undefinedVarsReturnEmpty = false;
      });

      const clonedState = cloneState(rootState, propertySettings);

      await saveContainer(clonedState);
      this.setPropertySettings(payload);
    }
  }
};
