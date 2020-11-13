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

import cmDispatchActions from './cmDispatchActions';
import codeMirrorInitialState from './codeMirrorInitialState';

export default (state, action) => {
  switch (action.type) {
    case cmDispatchActions.INITIALIZE:
      return codeMirrorInitialState;
    case cmDispatchActions.USER_UPDATE_VALUE:
      return {
        ...state,
        value: action.value,
        isDirty: true
      };
    case cmDispatchActions.SET_PERSISTENT_VALUE:
      return {
        ...state,
        persistentValue: action.value,
        isDirty: true
      };
    case cmDispatchActions.SYNC_VALUE_AND_PERSISTENT_VALUE:
      return {
        ...state,
        value: action.value,
        persistentValue: action.value,
        isDirty: false
      };
    default:
      return state;
  }
};
