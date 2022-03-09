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

import { LAUNCH_ENVIRONMENT_NAME } from '../constants';

const activePromises = {};

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

export const getExtensionDescriptorFromApi = () => {
  activePromises.getExtensionDescriptor =
    activePromises.getExtensionDescriptor ||
    fetchJson(`${window.EXPRESS_PUBLIC_URL}/extensionDescriptor`);

  return activePromises.getExtensionDescriptor;
};

export const getStatus = () => {
  activePromises.getStatus =
    activePromises.getStatus ||
    fetchJson(`${window.EXPRESS_PUBLIC_URL}/status`).then((data) => {
      delete activePromises.getStatus;
      return data;
    });

  return activePromises.getStatus;
};

export const getEditorRegistry = () => fetchJson(`${window.EXPRESS_PUBLIC_URL}/editor-registry.js`);
export const getContainerData = () => fetchJson(`${window.EXPRESS_PUBLIC_URL}/editor-container.js`);

export const saveContainerData = async (containerData) => {
  try {
    const container = await getContainerData();
    // back support older container files that never had this environment object
    const fallbackDefaultEnvironment = {
      id: LAUNCH_ENVIRONMENT_NAME,
      stage: 'development'
    };
    const saveResponse = await fetch(`${window.EXPRESS_PUBLIC_URL}/editor-container.js`, {
      method: 'POST',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...containerData,
        environment: container.environment || fallbackDefaultEnvironment
      })
    });

    if (!saveResponse.ok) {
      const body = await saveResponse.text();
      throw new Error(`${saveResponse.statusText}: ${body}`);
    }

    return saveResponse;
  } catch (e) {
    throw new Error(`An error occurred when saving the container: ${e.message}.`);
  }
};

export const sendEdgeRequest = (body) =>
  fetch(`${window.EXPRESS_PUBLIC_URL}/process-edge-request`, {
    method: 'POST',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json'
    },
    body
  })
    .then(async (response) => {
      if (!response.ok) {
        const responseBody = await response.text();
        throw new Error(`${response.statusText}: ${responseBody}`);
      }

      return response.json();
    })
    .catch((e) => {
      throw new Error(`An error occured when processing the hit: ${e.message}.`);
    });
