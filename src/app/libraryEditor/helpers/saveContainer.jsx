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

import produce from 'immer';
import { saveContainerData } from '../../api/index';

const arrayToObj = (result, item) => {
  const itemName = item.name;
  delete item.name;

  result[itemName] = item;
  return result;
};

export default (state) => {
  const transformedState = produce(state, (draft) => {
    draft.extensions = draft.extensions.reduce(arrayToObj, {});
    draft.dataElements = draft.dataElements.reduce(arrayToObj, {});
  });

  const { extensions, dataElements, rules, property, company } = transformedState;

  const containerData = {
    extensions,
    dataElements,
    rules,
    property,
    company
  };

  return saveContainerData(containerData);
};
