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

import { NOT_AVAILABLE } from './constants';

export default (items) => {
  const groupedItems = {};

  if (items) {
    items.forEach((item) => {
      const categoryName = item.categoryName || NOT_AVAILABLE;
      if (!groupedItems[categoryName]) {
        groupedItems[categoryName] = [];
      }
      groupedItems[categoryName].push(item);
    });
  }
  Object.keys(groupedItems).forEach((categoryName) => {
    groupedItems[categoryName].sort((a, b) => {
      return a.displayName > b.displayName;
    });
  });

  return groupedItems;
};
