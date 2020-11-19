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
import getCategorizedItems from './getCategorizedItems';
import getSortedCategories from './getSortedCategories';

export default (extensionName, viewType, viewDescriptorsByType) => {
  if (viewType === VIEW_GROUPS.CONFIGURATION) {
    return null;
  }

  const defaultView = localStorage.getItem(`lastSelectedView/${extensionName}`);

  if (
    viewDescriptorsByType &&
    viewDescriptorsByType.filter((v) => `${viewType}/${v.name}` === defaultView).length > 0
  ) {
    return defaultView;
  }

  if (viewDescriptorsByType) {
    const categorizedItems = getCategorizedItems(viewDescriptorsByType);
    const sortedCategories = getSortedCategories(categorizedItems);

    return `${viewType}/${categorizedItems[sortedCategories[0]][0].name}`;
  }

  return '';
};
