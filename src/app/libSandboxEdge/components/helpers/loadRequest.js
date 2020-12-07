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

import getDefaultRequest from './getDefaultRequest';

export default ({ extensionDescriptor: { name, platform }, setRequest, setXdm }) => {
  let request = localStorage.getItem(`requestData/${name}/${platform}`);

  if (request) {
    request = JSON.parse(request);
  } else {
    request = getDefaultRequest();
  }

  const {
    body: { xdm }
  } = request;

  setXdm(JSON.stringify(xdm, null, 2));
  setRequest(JSON.stringify(request, null, 2));
};
