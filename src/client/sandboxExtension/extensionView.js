/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

// eslint-disable-next-line no-unused-vars
const Form = {
  create(fields, root) {
    // eslint-disable-next-line no-param-reassign
    root.innerHTML = this.buildForm(fields);
    this.setupExtensionBridge(fields);
  },

  buildForm(fields) {
    return `${'<div class="pure-form pure-form-stacked"><fieldset>'}${this.buildFields(
      fields
    )}</fieldset></div>`;
  },

  buildFields(fields) {
    let fieldsContent = '';

    Object.keys(fields).forEach((fieldName) => {
      fieldsContent += this.buildField(fieldName, fields[fieldName]);
    }, this);

    return fieldsContent;
  },

  buildField(fieldName, fieldData) {
    return `${'<div class="pure-control-group"><label for="'}${fieldName}">${
      fieldData.title
    }</label><input id="${fieldName}" type="text">${this.buildFieldMessage(fieldData)}</div>`;
  },

  buildFieldMessage(fieldData) {
    let msg = '';

    if (fieldData.type === 'array') {
      msg += 'Comma separated values are accepted.';
    }

    if (!fieldData.required) {
      msg += ' (optional)';
    }

    return `<span class="pure-form-message-inline">${msg}</span>`;
  },

  setupExtensionBridge(fields) {
    const fieldNames = Object.keys(fields);

    window.extensionBridge.register({
      init(info) {
        fieldNames.forEach((fieldName) => {
          let fieldValue = (info.settings && info.settings[fieldName]) || '';
          if (Array.isArray(fieldValue)) {
            fieldValue = fieldValue.join(',');
          }
          document.getElementById(fieldName).value = fieldValue;
        }, this);
      },

      getSettings() {
        const settings = {};

        fieldNames.forEach((fieldName) => {
          settings[fieldName] = document.getElementById(fieldName).value || '';
          if (fields[fieldName].type === 'array') {
            settings[fieldName] = settings[fieldName].split(',').map((s) => s.trim());
          }
        }, this);

        Object.keys(settings).forEach((key) => {
          return (settings[key] === '' || settings[key] == null) && delete settings[key];
        });

        return settings;
      },

      validate() {
        let result = true;

        fieldNames.forEach((fieldName) => {
          if (fields[fieldName].required) {
            const fieldInput = document.getElementById(fieldName);
            if (!fieldInput.value) {
              fieldInput.parentNode.classList.add('error');
              result = false;
            } else {
              fieldInput.parentNode.classList.remove('error');
            }
          }
        }, this);

        return result;
      }
    });
  }
};
