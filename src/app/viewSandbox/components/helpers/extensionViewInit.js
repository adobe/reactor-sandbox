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

// eslint-disable-next-line import/no-extraneous-dependencies
import { ERR_CONNECTION_DESTROYED } from 'penpal';
import reportFatalError from './reportFatalError';
import VIEW_GROUPS from '../../helpers/viewsGroups';
import { LOG_PREFIX } from './constants';

export default ({ extensionBridge, selectedDescriptor, extensionDescriptor, content }) => {
  if (!extensionBridge || !selectedDescriptor || !extensionDescriptor) {
    return;
  }

  const { name: extensionName } = extensionDescriptor;
  const {
    type: delegateType,
    descriptor: { name: delegateName }
  } = selectedDescriptor;

  try {
    const parsedContent = JSON.parse(content);

    extensionBridge.promise.then((api) => {
      try {
        api
          .init(parsedContent)
          .then(() => {
            localStorage.setItem(
              `initInfo/${extensionName}/${delegateType}${
                delegateType !== VIEW_GROUPS.CONFIGURATION ? `/${delegateName}` : ''
              }`,
              content
            );

            // eslint-disable-next-line no-console
            console.log(`${LOG_PREFIX} init() with`, parsedContent);
          })
          .catch(reportFatalError);
      } catch (error) {
        if (error.code !== ERR_CONNECTION_DESTROYED) {
          reportFatalError(error);
        }
      }
    });
  } catch (e) {
    reportFatalError(e);
  }
};
