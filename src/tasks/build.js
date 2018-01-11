/***************************************************************************************
 * (c) 2017 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 ****************************************************************************************/



/**
 * Builds a static, standalone sandbox directory. Does not provide any web server.
 * The created directory is "sandbox" under the current working directory.
 */

const path = require('path');
const fs = require('fs-extra');
const webpack = require('webpack');
const chalk = require('chalk');
const validateExtensionDescriptor = require('@adobe/reactor-validator');
const getExtensionDescriptor = require('./helpers/getExtensionDescriptor');
const getExtensionDescriptorScript = require('./helpers/getExtensionDescriptorScript');
const getContainer = require('./helpers/getContainer');
const files = require('./constants/files');
const replace = require('replace-in-file');

module.exports = function() {
  const extensionDescriptor = getExtensionDescriptor();
  const validationError = validateExtensionDescriptor(extensionDescriptor);

  if (validationError) {
    console.log(chalk.red(validationError));
    process.exit(1);
  }

  fs.ensureDirSync(files.DIST_PATH);

  fs.writeFileSync(path.resolve(files.DIST_PATH, files.EXTENSION_DESCRIPTOR_SCRIPT_FILENAME),
    getExtensionDescriptorScript());

  fs.copySync(files.TURBINE_ENGINE_PATH, path.resolve(files.DIST_PATH, files.ENGINE_FILENAME));

  // Produces viewSandbox.js
  const webpackConfig = require('./webpack.viewSandbox.config');
  webpackConfig.output.path = files.DIST_PATH;
  webpack(webpackConfig).run(function() {});

  const extensionViewsPath = path.resolve(extensionDescriptor.viewBasePath);
  fs.copySync(extensionViewsPath, path.resolve(files.DIST_PATH, files.EXTENSION_VIEWS_DIRNAME));

  fs.copySync(files.CLIENT_SRC_PATH, files.DIST_PATH);

  try {
    fs.copySync(files.CONSUMER_CLIENT_SRC_PATH, files.DIST_PATH);
  } catch (error) {
    // It will throw an error if the consumer doesn't have an override directory. That's okay.
  }

  fs.writeFileSync(path.resolve(files.DIST_PATH, files.CONTAINER_FILENAME), getContainer());

  // We need to replace the extension bridge from akamai with one that is bundled inside the build.
  fs.copySync(files.EXTENSION_BRIDGE_PATH, files.DIST_PATH);

  var script = '<script>' +
      'var basePath = window.parent.location.href.replace(/\\/[^\/]*$/, "");' +
      'document.write(\'<script src="\' + basePath + \'\/extensionbridge.min.js">' +
      '<\\/script><script src="\' + basePath + \'\/extensionbridge-child.js"><\\/script>\');' +
    '</script>';

  replace.sync({
    files: path.join(files.DIST_PATH, '**/*\.html'),
    from: new RegExp('<script.*src=".*' + files.EXTENSION_BRIDGE + '".*?></script>', 'igm'),
    to: script,
    allowEmptyPaths: false
  });

  replace.sync({
    files: path.join(path.resolve(files.DIST_PATH, 'noConfigIframe\.html')),
    from: new RegExp('<script.*src=".*' + files.EXTENSION_BRIDGE + '".*?></script>', 'igm'),
    to: '<script src="./' + files.EXTENSION_BRIDGE + '"></script>' +
    '<script src="./' + files.EXTENSION_BRIDGE_CHILD + '"></script>',
    allowEmptyPaths: false
  });

  replace.sync({
    files: path.resolve(path.join(files.DIST_PATH, files.EXTENSION_BRIDGE)),
    from: new RegExp('/extensionbridge/' + files.EXTENSION_BRIDGE_CHILD),
    to: 'about:blank',
    allowEmptyPaths: false
  });
};
