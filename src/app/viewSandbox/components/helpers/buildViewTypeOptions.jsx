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

import VIEW_GROUPS from '../../helpers/viewsGroups';

const viewGroupOptionDescriptors = [
  {
    id: VIEW_GROUPS.CONFIGURATION,
    name: 'Extension Configuration'
  },
  {
    id: VIEW_GROUPS.EVENTS,
    name: 'Events'
  },
  {
    id: VIEW_GROUPS.CONDITIONS,
    name: 'Conditions'
  },
  {
    id: VIEW_GROUPS.ACTIONS,
    name: 'Actions'
  },
  {
    id: VIEW_GROUPS.DATA_ELEMENTS,
    name: 'Data Elements'
  }
];

export default (extensionDescriptor) => {
  if (!extensionDescriptor) {
    return [];
  }

  return viewGroupOptionDescriptors.reduce((allOptions, { id, name }) => {
    if (!extensionDescriptor[id]) {
      return allOptions;
    }

    const items = extensionDescriptor[id] || [];
    // extension configuration is an object, so make an option for it if it exists.
    if (id === VIEW_GROUPS.CONFIGURATION || (Array.isArray(items) && items.length)) {
      return allOptions.concat({ id, name });
    }

    return allOptions;
  }, []);
};
