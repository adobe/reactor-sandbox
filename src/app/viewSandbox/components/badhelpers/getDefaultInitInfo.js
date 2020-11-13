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

export default ({ selectedViewGroup, selectedExtensionViewDescriptor }) => {
  const info = {
    settings: null,
    propertySettings: {
      domains: ['adobe.com', 'example.com'],
      linkDelay: 100,
      trackingCookieName: 'sat_track',
      undefinedVarsReturnEmpty: false
    },
    tokens: {
      imsAccess: 'X34DF56GHHBBFFGH'
    },
    company: {
      orgId: 'ABCDEFGHIJKLMNOPQRSTUVWX@AdobeOrg'
    },
    schema: selectedExtensionViewDescriptor?.schema || null
  };

  if (selectedViewGroup !== VIEW_GROUPS.CONFIGURATION) {
    info.extensionSettings = {
      foo: 'bar'
    };
  }

  return info;
};
