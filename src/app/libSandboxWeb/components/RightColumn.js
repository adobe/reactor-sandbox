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
import { Button, Text } from '@adobe/react-spectrum';
import Draw from '@spectrum-icons/workflow/Draw';
import { useHistory } from 'react-router-dom';
import { NAMED_ROUTES } from '../../constants';

export default ({ templateLocation, isLatestTemplate }) => {
  const history = useHistory();

  return (
    <div>
      <p>Welcome to the Library Sandbox. In this page you can test your library logic.</p>

      {templateLocation === 'sandbox' ? (
        <>
          <p>
            In the left pane of the page you can see a default template loaded inside an IFRAME
            element. The template represents a simple page that loads an empty Launch library.
          </p>
          <p>
            You can customize the template to support your use cases if needed. You can run the
            command <code>npx @adobe/reactor-sandbox init</code> inside your extension folder. You
            can customize the template to support your unique use cases by first running{' '}
            <code>npx @adobe/reactor-sandbox init</code> inside your extension directory. This will
            produce a file at
            <code>.sandbox/libSandbox.html</code>, which you can then modify as necessary to
            simulate a Launch customer&lsquo;s website. For example, you can add buttons and other
            elements to simulate a specific scenario. The next time you refresh the Library Sandbox
            in the browser, the new content will be shown inside the IFRAME.
          </p>
          <p>
            For more informations about the <code>init</code> command you can check the{' '}
            <a
              href="https://www.npmjs.com/package/@adobe/reactor-sandbox#configuring-the-sandbox"
              rel="noreferrer"
              target="_blank"
            >
              documentation
            </a>{' '}
            .
          </p>
          <p>
            You can configure the extensions, data elements, and rules emitted in the sandbox Launch
            library by using the Library Editor.
          </p>

          <Button
            variant="cta"
            onPress={() => {
              history.push(NAMED_ROUTES.LIBRARY_EDITOR);
            }}
          >
            <Draw marginEnd="size-50" />
            <Text>Go to Library Editor</Text>
          </Button>
        </>
      ) : null}

      {isLatestTemplate === false ? (
        <p>
          It seems there is a problem with your template. Follow the steps listed in the left pane
          of the page in order to contiune.
        </p>
      ) : null}

      {templateLocation === 'extension' && isLatestTemplate ? (
        <>
          <p>
            You can customize the template that is loaded in the left pane of the page by editing
            the file found at the following location: <code>.sandbox/libSandbox.html</code>.
          </p>

          <p>
            In the left pane of the page you can see an HTML page loaded inside an IFRAME element.
            The HTML page loads a Launch library. You can customize the HTML page to simulate a
            Launch customer&lsquo;s website by modifying the file located at
            <code>.sandbox/libSandbox.html</code> within your extension directory. For example, you
            can add buttons and other elements to simulate a specific scenario. The next time you
            refresh the Library Sandbox in the browser, the new content will be shown inside the
            IFRAME.
          </p>

          <Button
            variant="cta"
            onPress={() => {
              history.push(NAMED_ROUTES.LIBRARY_EDITOR);
            }}
          >
            <Draw marginEnd="size-50" />
            <Text>Go to Library Editor</Text>
          </Button>
        </>
      ) : null}
    </div>
  );
};
