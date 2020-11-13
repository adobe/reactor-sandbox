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

import VIEW_GROUPS from './viewsGroups';
import getCategorizedItems from './getCategorizedItems';
import getSortedCategories from './getSortedCategories';
import getExtensionViewSelectorOptions from './getExtensionViewSelectorOptions';

let neverCalled = true;

export default ({
  extensionDescriptor,
  viewGroup,
  setSelectedExtensionView,
  setExtensionViewOptions
}) => {
  localStorage.setItem('lastSelectedViewGroup', viewGroup);

  if (viewGroup === VIEW_GROUPS.CONFIGURATION) {
    if (extensionDescriptor[VIEW_GROUPS.CONFIGURATION]) {
      setSelectedExtensionView(VIEW_GROUPS.CONFIGURATION);
    }

    return;
  }

  let newSelectedExtensionView = '';

  const items = extensionDescriptor[viewGroup];
  const categorizedItems = getCategorizedItems(items);
  const sortedCategories = getSortedCategories(categorizedItems);
  const extensionViewOptions = getExtensionViewSelectorOptions({
    viewGroup,
    categorizedItems,
    sortedCategories
  });

  setExtensionViewOptions(extensionViewOptions);

  if (extensionViewOptions.length) {
    const [firstCategory] = sortedCategories;
    const [firstCategoryItem] = categorizedItems[firstCategory];

    newSelectedExtensionView = `${viewGroup}${
      firstCategoryItem.name ? `/${firstCategoryItem.name}` : ''
    }`;
  }

  // Restore the view stored in local storage if the stored value is a valid view.
  if (neverCalled) {
    neverCalled = false;
    const lastSelectedExtensionView = localStorage.getItem('lastSelectedExtensionView');

    if (items.filter((i) => `${viewGroup}/${i.name}` === lastSelectedExtensionView).length > 0) {
      newSelectedExtensionView =
        localStorage.getItem('lastSelectedExtensionView') || newSelectedExtensionView;
    }
  }

  setSelectedExtensionView(newSelectedExtensionView);
};
