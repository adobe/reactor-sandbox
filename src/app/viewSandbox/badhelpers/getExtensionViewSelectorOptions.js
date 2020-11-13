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

import { NOT_AVAILABLE } from './constants';

export default ({ categorizedItems, sortedCategories, viewGroup }) => {
  return sortedCategories.map((categoryName) => {
    const categoryItems = categorizedItems[categoryName].map((item) => {
      const value = `${viewGroup}${item.name ? `/${item.name}` : ''}`;

      return (
        <option key={value} value={value}>
          {item.displayName}
        </option>
      );
    });

    if (categoryName !== NOT_AVAILABLE) {
      return (
        <optgroup key={categoryName} label={categoryName}>
          {categoryItems}
        </optgroup>
      );
    }

    return categoryItems;
  });
};
