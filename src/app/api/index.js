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

/* eslint-disable import/prefer-default-export */

const fetchJson = (endpoint) =>
  fetch(endpoint)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Request response was not ok.');
      }

      return response.json();
    })
    .catch(() => {
      throw new Error(`An error occured when fetching ${endpoint}.`);
    });

export const getExtensionDescriptorFromApi = () =>
  fetchJson(`${window.EXPRESS_PUBLIC_URL}/extensionDescriptor`);

export const getStatus = () => fetchJson(`${window.EXPRESS_PUBLIC_URL}/status`);

export const getEditorRegistry = () => fetchJson(`${window.EXPRESS_PUBLIC_URL}/editor-registry.js`);
export const getContainerData = () => fetchJson(`${window.EXPRESS_PUBLIC_URL}/editor-container.js`);

export const saveContainerData = (containerData) =>
  fetch(`${window.EXPRESS_PUBLIC_URL}/editor-container.js`, {
    method: 'POST',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(containerData)
  }).catch((e) => {
    throw new Error(`An error occured when saving the container: ${e.message}.`);
  });
