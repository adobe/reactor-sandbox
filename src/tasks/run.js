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

/* eslint-disable no-console */

/**
 * Runs a webserver that provides the sandbox environment. Refreshing will load the latest content.
 */

const path = require('path');
const fs = require('fs');
const https = require('https');
const express = require('express');
const chalk = require('chalk');
const validateExtensionDescriptor = require('@adobe/reactor-validator');
const bodyParser = require('body-parser');
const getExtensionDescriptor = require('./helpers/getExtensionDescriptor');
const getExtensionDescriptors = require('./helpers/getExtensionDescriptors');
const getContainer = require('./helpers/getContainer');
const files = require('./constants/files');
const editorRegistry = require('./helpers/editorRegistry');
const saveContainer = require('./helpers/saveContainer');
const unTransform = require('./helpers/unTransform');
const isSandboxLinked = require('../helpers/isSandboxLinked');
const executeSandboxComponents = require('../helpers/executeSandboxComponents');
const { templateLocation, isLatestTemplate } = require('./helpers/librarySandbox');

const PORT = 3000;
const SSL_PORT = 4000;

process.on('uncaughtException', (err) => {
  console.log(err);
  process.exit(1);
});

const configureApp = (app) => {
  let validationError;

  app.use((_, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });

  app.use(bodyParser.json());

  https
    .createServer(
      {
        key: fs.readFileSync(`${__dirname}/../../cert/key.pem`),
        cert: fs.readFileSync(`${__dirname}/../../cert/cert.pem`)
      },
      app
    )
    .listen(SSL_PORT);

  // // Serve the rule editor
  // app.use(express.static(path.resolve(`${__dirname}/../../build`)));

  const extensionDescriptor = getExtensionDescriptor();
  console.log('VALIDATING EXTENSION DESCRIPTOR ON STARTUP OF EXPRESS');
  validationError = validateExtensionDescriptor(extensionDescriptor);

  // If there is a validation error, we're going to let express still run. This gives the
  // extension developer a chance to fix their extension.json or whatever without having to
  // re-run the sandbox.
  if (validationError) {
    console.error(chalk.red(validationError));
  }

  app.get(`/${files.LAUNCH_LIBRARY_FILENAME}`, (req, res) => {
    // Always pull the latest extension descriptor. The extension developer may have changed it
    // since the last request.
    validationError = validateExtensionDescriptor(getExtensionDescriptor());

    if (validationError) {
      console.error(chalk.red(validationError));
      res.status(500).send(validationError);
    } else {
      const containerJS = getContainer();
      const turbine = fs.readFileSync(files.TURBINE_ENGINE_PATH);
      const launchLibContents = containerJS + turbine;
      res.setHeader('Content-Type', 'application/javascript');
      res.send(launchLibContents);
    }
  });

  app.get(`/${files.EXTENSION_DESCRIPTOR_SCRIPT_FILENAME}`, (req, res) => {
    res.send(getExtensionDescriptor());
  });

  app.get('/extensionbridge/extensionbridge-child.js', (req, res) => {
    res.sendFile(files.EXTENSION_BRIDGE_CHILD_PATH);
  });

  // Serve hosted lib files from inside extensions.
  app.get('/hostedLibFiles/:extensionName/:extensionVersion/:file', (req, res) => {
    const { params } = req;
    const { extensionName } = params;
    const { extensionVersion } = params;
    const { file } = params;

    // In case someone edited `extension.json` we want always to get the latest
    // data everytime a new request arrives.
    const extensionDescriptors = getExtensionDescriptors();

    // Get the descriptor that matches the extension name and the version from the request.
    // eslint-disable-next-line no-shadow
    const extensionDescriptor = extensionDescriptors[extensionName];
    console.log('GETTING EXTENSION DESCRIPTION FOR ', extensionName);

    if (!extensionDescriptor || extensionDescriptor.version !== extensionVersion) {
      res.status(404).send(`Cannot GET ${req.originalUrl}`);
      return;
    }

    const { extensionDescriptorPath } = extensionDescriptor;
    // If no hosted files are defined in the descriptor, do nothing.
    const hostedFilePath = (extensionDescriptor.hostedLibFiles || []).filter((hfp) => {
      return hfp.endsWith(file);
    })[0];

    if (!hostedFilePath) {
      res.status(404).send(`Cannot GET ${req.originalUrl}`);
      return;
    }

    const extensionPath = path.dirname(path.resolve(extensionDescriptorPath));
    res.sendFile(path.join(extensionPath, hostedFilePath));
  });

  // We serve all the view folders from each detected extension.
  const extensionDescriptors = getExtensionDescriptors();
  Object.keys(extensionDescriptors).forEach((key) => {
    const ed = extensionDescriptors[key];

    const extensionViewsPath = path.resolve(
      path.dirname(path.resolve(ed.extensionDescriptorPath)),
      ed.viewBasePath
    );

    app.use(
      `/${files.EXTENSION_VIEWS_DIRNAME}/${ed.name}/${ed.version}`,
      express.static(extensionViewsPath)
    );
  });

  app.get('/status', (_, res) =>
    res.json({
      librarySandbox: {
        templateLocation: templateLocation(),
        isLatestTemplate: isLatestTemplate()
      }
    })
  );

  // Serve /libSandbox.html
  app.get(`/${files.LIB_SANDBOX_HTML_FILENAME}`, (_, res) => {
    if (templateLocation() === 'extension') {
      res.sendFile(`${files.CONSUMER_PROVIDED_FILES_PATH}/${files.LIB_SANDBOX_HTML_FILENAME}`);
    } else {
      res.sendFile(`${files.INIT_FILES_SRC_PATH}/${files.LIB_SANDBOX_HTML_FILENAME}`);
    }
  });

  // Server Sandbox Extension Files: noConfigIframe.html,
  // localStorage.html (local storage data element),
  // javascriptVariable.html (javascript variable data element).
  app.use(express.static(files.SANDBOX_EXTENSION_SRC_PATH));

  app.get('/editor-container.js', (req, res) => {
    try {
      // eslint-disable-next-line no-eval
      eval(
        fs
          .readFileSync(path.resolve(files.CONSUMER_PROVIDED_FILES_PATH, files.CONTAINER_FILENAME))
          .toString('utf8')
          .replace('module.exports = ', 'var container =')
          .replace('};', '}')
          .trim()
      );

      // container will be available after eval finishes.
      // eslint-disable-next-line no-undef
      const containerContent = JSON.stringify(container, unTransform);

      res.setHeader('Content-Type', 'application/json');
      res.send(containerContent);
    } catch (error) {
      res.status(404);
      res.send('File not found.');
    }
  });

  app.post('/editor-container.js', (req, res) => {
    try {
      saveContainer(req.body);
      res.status(200);
      res.send('OK');
    } catch (error) {
      res.status(500);
      res.send(error.message);
    }
  });

  app.get('/editor-registry.js', (req, res) => {
    // In case someone edited `extension.json` we want always to get the latest
    // data everytime a new request arrives.
    const eds = getExtensionDescriptors();

    const registryContent = editorRegistry(eds, {
      request: req,
      ports: {
        http: PORT,
        https: SSL_PORT
      }
    });

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(registryContent));
  });
};

if (isSandboxLinked()) {
  executeSandboxComponents();
}

module.exports = () => {
  return new Promise((resolve, reject) => {
    const app = express();

    configureApp(app);

    app.listen(PORT, (error) => {
      if (error) {
        reject(error);
      } else {
        console.log(
          `\nExtension sandbox running at \
http://localhost:${PORT} and at https://localhost:${SSL_PORT}`
        );
        resolve();
      }
    });
  });
};
