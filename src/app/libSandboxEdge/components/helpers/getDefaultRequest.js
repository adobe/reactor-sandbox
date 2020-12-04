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

/* eslint-disable no-bitwise */

const uuidv4 = () =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });

const formattedDate = (d) => {
  const t = d.getTimezoneOffset();

  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDay()
  ).padStart(2, '0')}T${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(
    2,
    '0'
  )}:${String(d.getSeconds()).padStart(2, '0')}.${String(d.getMilliseconds()).padStart(3, '0')}${
    t < 0 ? '-' : '+'
  }${String(t / 60).padStart(2, '0')}:00`;
};

export default () => {
  const uuid = uuidv4();
  const d = new Date();

  return {
    header: {
      requestId: uuid,
      receivedAt: 1607050908130,
      dispatchedAt: 1607050908209,
      configId: '00000000-0000-0000-0000-000000000000',
      orgId: '000000000000000000000000@AdobeOrg',
      httpHeaders: {
        'x-request-id': [uuid],
        referer: ['http://localhost:8080/'],
        'user-agent': ['Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6)'],
        'x-organization-id': ['000000000000000000000000@AdobeOrg'],
        'x-environment-id': ['0000000000000000000000000000000000'],
        'x-property-id': ['0000000000000000000000000000000000']
      }
    },
    body: {
      xdm: {
        identityMap: {
          ECID: [
            {
              id: '00000000000000000000000000000000000000',
              authenticatedState: 'ambiguous',
              primary: true
            }
          ]
        },
        web: {
          webPageDetails: {
            URL: 'http://localhost:8080/'
          },
          webReferrer: {
            URL: ''
          }
        },
        device: {
          screenHeight: 1440,
          screenWidth: 3440,
          screenOrientation: 'landscape'
        },
        environment: {
          type: 'browser',
          browserDetails: {
            viewportWidth: 2293,
            viewportHeight: 480,
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6)'
          },
          ipV4: '0.0.0.0'
        },
        placeContext: {
          localTime: formattedDate(d),
          localTimezoneOffset: d.getTimezoneOffset()
        },
        timestamp: d.toISOString('YYYY-MM-DDTHH:mm:ss.sssZ'),
        implementationDetails: {
          name: 'https://ns.adobe.com/experience/alloy',
          version: '2.1.0',
          environment: 'browser'
        },
        _id: uuid
      },
      exchanged: [],
      extra: {
        config: {},
        state: {}
      }
    }
  };
};
