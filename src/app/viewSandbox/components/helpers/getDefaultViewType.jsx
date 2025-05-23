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

export default (platform, extensionName, extensionViewDescriptorsByValue) => {
  const defaultViewType = localStorage.getItem(`lastSelectedViewType/${platform}/${extensionName}`);
  const availableTypes = Object.keys(extensionViewDescriptorsByValue || {})
    .map((delegateName) => delegateName.split('/')[0])
    .filter((value, index, self) => self.indexOf(value) === index);

  if (defaultViewType && availableTypes.includes(defaultViewType)) {
    return defaultViewType;
  }

  return availableTypes[0];
};
