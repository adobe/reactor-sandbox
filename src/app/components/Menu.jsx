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

/* eslint-disable jsx-a11y/anchor-is-valid */

import React, { useState, useEffect } from 'react';
import semverDiff from 'semver-diff';
import { withRouter, useHistory } from 'react-router-dom';
import {
  Flex,
  ActionButton,
  Text,
  Heading,
  Divider,
  ActionGroup,
  Link,
  Item
} from '@adobe/react-spectrum';

import LibrarySandboxIcon from '@spectrum-icons/workflow/Code';
import LibraryEditorIcon from '@spectrum-icons/workflow/FileCode';
import ViewSandboxIcon from '@spectrum-icons/workflow/AdDisplay';
import packageJson from '../../../package.json';
import { getStatus } from '../api/index';

import { NAMED_ROUTES } from '../constants';

const Menu = ({ location }) => {
  const history = useHistory();
  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
  const [sandboxOutdatedData, setSandboxOutdatedData] = useState({
    isOutdated: false,
    latestVersion: null
  });

  useEffect(() => {
    getStatus().then(({ latestVersion }) => {
      if (semverDiff(packageJson.version, latestVersion)) {
        setSandboxOutdatedData({ isOutdated: true, latestVersion });
      }
    });

    if (location.pathname.includes(NAMED_ROUTES.LIBRARY_EDITOR)) {
      setSelectedKeys(new Set([NAMED_ROUTES.LIBRARY_EDITOR]));
    } else if (location.pathname.endsWith(NAMED_ROUTES.LIB_SANDBOX)) {
      setSelectedKeys(new Set([NAMED_ROUTES.LIB_SANDBOX]));
    } else if (location.pathname.includes(NAMED_ROUTES.VIEW_SANDBOX)) {
      setSelectedKeys(new Set([NAMED_ROUTES.VIEW_SANDBOX]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Flex direction="column">
      <Flex direction="row">
        <Flex direction="row" gap="size-200" margin="size-150" flex>
          <ActionButton
            isQuiet
            onPress={() => {
              history.push(NAMED_ROUTES.HOME);
              setSelectedKeys(new Set([]));
            }}
          >
            <Heading>Reactor Sandbox</Heading>
          </ActionButton>

          <ActionGroup
            isQuiet
            orientation="horizontal"
            selectionMode="single"
            selectedKeys={selectedKeys}
            onSelectionChange={(key) => {
              const path = [...key][0];
              if (path) {
                setSelectedKeys(new Set([path]));
                history.push(path);
              }
            }}
          >
            <Item key={NAMED_ROUTES.VIEW_SANDBOX} textValue="View Sandbox">
              <ViewSandboxIcon />
              <Text>View Sandbox</Text>
            </Item>
            <Item key={NAMED_ROUTES.LIB_SANDBOX} textValue="Library Sandbox">
              <LibrarySandboxIcon />
              <Text>Library Sandbox</Text>
            </Item>
            <Item key={NAMED_ROUTES.LIBRARY_EDITOR} textValue="Library Editor">
              <LibraryEditorIcon />
              <Text>Library Editor</Text>
            </Item>
          </ActionGroup>
        </Flex>

        {sandboxOutdatedData.isOutdated ? (
          <Flex gap="size-100" alignItems="center" marginEnd="size-225">
            <Text>
              New Version Available:{' '}
              <Link marginStart="size-50">
                <a
                  href="https://www.npmjs.com/package/@adobe/reactor-sandbox"
                  target="_blank"
                  rel="noreferrer"
                >
                  {sandboxOutdatedData.latestVersion}
                </a>
              </Link>
            </Text>
          </Flex>
        ) : null}
      </Flex>

      <Divider size="M" />
    </Flex>
  );
};

export default withRouter(Menu);
