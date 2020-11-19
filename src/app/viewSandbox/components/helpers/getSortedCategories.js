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

import { NOT_AVAILABLE, OTHER } from './constants';

export default (categorizedItems) =>
  Object.keys(categorizedItems).sort((a, b) => {
    const categoriesToBePlacedLast = [NOT_AVAILABLE, OTHER];
    for (let i = 0; i < categoriesToBePlacedLast.length; i += 1) {
      if (a === categoriesToBePlacedLast[i] || b === categoriesToBePlacedLast[i]) {
        return a === categoriesToBePlacedLast[i] ? 1 : -1;
      }
    }

    if (a < b) {
      return -1;
    }

    if (a > b) {
      return 1;
    }

    return 0;
  });
