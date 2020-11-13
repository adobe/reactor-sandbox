/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const fs = require('fs');
const path = require('path');
const files = require('../constants/files');

const templatePathInsideExtension = path.join(
  files.CONSUMER_PROVIDED_FILES_PATH,
  files.LIB_SANDBOX_HTML_FILENAME
);

const isTemplateInsideExtension = () => fs.existsSync(templatePathInsideExtension);
const isLatestTemplate = () => {
  const contents = fs.readFileSync(templatePathInsideExtension);
  const hasOldContainer = contents.indexOf('container.js') !== -1;
  const hasOldEngine = contents.indexOf('engine.js') !== -1;
  const hasViewSandboxLink = contents.indexOf('href="viewSandbox.html"') !== -1;

  return !(hasOldContainer || hasOldEngine || hasViewSandboxLink);
};

module.exports = {
  templateLocation: () => (isTemplateInsideExtension() ? 'extension' : 'sandbox'),
  isLatestTemplate: () => (isTemplateInsideExtension() ? isLatestTemplate() : true)
};
