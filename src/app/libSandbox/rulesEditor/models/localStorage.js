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

export default {
  extensionName: null,
  state: Map({
    dataElements: [],
    rules: [],
    extensions: []
  }),
  get() {
    return this.state;
  },
  loadStateFor(extensionName) {
    this.extensionName = extensionName;

    const state = JSON.parse(
      localStorage.getItem(`sandbox-rule-editor-container-${extensionName}`)
    );
    if (state) {
      this.state = fromJS(state);
    }
  },
  update(key, value) {
    let newValue;
    if (key === 'extensions' || key === 'dataElements') {
      newValue = value.reduce(
        (result, item) => result.set(item.get('name'), item.delete('name')),
        Map()
      );
    } else {
      newValue = value.toJS();
    }
    this.state = this.state.set(key, newValue);

    if (this.extensionName) {
      localStorage.setItem(
        `sandbox-rule-editor-container-${this.extensionName}`,
        JSON.stringify(this.state.toJS())
      );
    }
  }
};
