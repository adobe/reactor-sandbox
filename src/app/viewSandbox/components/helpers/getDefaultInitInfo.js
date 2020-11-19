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

export default ({ type, descriptor }) => {
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
    schema: descriptor?.schema || null
  };

  if (type !== VIEW_GROUPS.CONFIGURATION) {
    const { settings, ...rest } = info;
    return JSON.stringify(
      {
        settings,
        extensionSettings: {
          foo: 'bar'
        },
        ...rest
      },
      null,
      2
    );
  }

  try {
    return JSON.stringify(info, null, 2);
  } catch (e) {
    // eslint-disable-next-line no-alert
    alert('An error has occurred. Please see the browser console.');
    throw e;
  }
};
