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

export default {
  extensionName: null,
  platform: null,
  state: {},
  get(key) {
    return this.state[key];
  },
  save() {
    if (this.extensionName) {
      localStorage.setItem(
        `sandboxRuleEditorContainer/${this.platform}/${this.extensionName}`,
        JSON.stringify(this.state)
      );
    }
  },
  loadStateFor(platform, extensionName) {
    this.extensionName = extensionName;
    this.platform = platform;

    const state =
      JSON.parse(localStorage.getItem(`sandboxRuleEditorContainer/${platform}/${extensionName}`)) ||
      {};

    if (state) {
      this.state = state;
    }
  },
  update(key, value) {
    const newValue = value;
    this.state = produce(this.state, (draft) => {
      draft[key] = newValue;
    });
  },

  delete() {
    localStorage.removeItem(`sandboxRuleEditorContainer/${this.platform}/${this.extensionName}`);
  }
};
