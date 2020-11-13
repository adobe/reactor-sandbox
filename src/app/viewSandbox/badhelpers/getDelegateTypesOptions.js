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

import React from 'react';
import VIEW_GROUPS from './viewsGroups';

const viewGroupOptionDescriptors = [
  {
    value: VIEW_GROUPS.CONFIGURATION,
    label: 'Extension Configuration'
  },
  {
    value: VIEW_GROUPS.EVENTS,
    label: 'Events'
  },
  {
    value: VIEW_GROUPS.CONDITIONS,
    label: 'Conditions'
  },
  {
    value: VIEW_GROUPS.ACTIONS,
    label: 'Actions'
  },
  {
    value: VIEW_GROUPS.DATA_ELEMENTS,
    label: 'Data Elements'
  }
];

export default (extensionDescriptor) =>
  viewGroupOptionDescriptors.reduce((allOptions, { label, value }) => {
    if (!Object.prototype.hasOwnProperty.call(extensionDescriptor, value)) {
      return allOptions;
    }

    const items = extensionDescriptor[value] || [];
    // extension configuration is an object, so make an option for it if it exists.
    if (value === VIEW_GROUPS.CONFIGURATION || (Array.isArray(items) && items.length)) {
      return allOptions.concat(
        <option key={label} value={value}>
          {label}
        </option>
      );
    }

    return allOptions;
  }, []);
