/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

/* global describe, it, expect, jest */

const path = require('path');

const FIXTURES_DIR = path.resolve(__dirname, '../../../test/fixtures/augmentExtensions');

// Drives the real augmentExtensions code path against a single fixture extension by stubbing
// extensionDescriptorPaths (normally a filesystem glob computed at import time) so it resolves to
// the fixture's extension.json. augmentExtensions reads the fixture's module source from disk and
// runs the match-requires scan on it -- the step that fails for newer ECMAScript syntax.
const runAugment = (fixtureDir) => {
  jest.resetModules();
  jest.doMock('./extensionDescriptorPaths', () => [
    path.join(FIXTURES_DIR, fixtureDir, 'extension.json')
  ]);

  const augmentExtensions = require('./augmentExtensions');
  const container = {};
  augmentExtensions(container);
  return container;
};

describe('augmentExtensions', () => {
  it('scans an extension written with newer ECMAScript syntax without throwing', () => {
    let container;
    expect(() => {
      container = runAugment('extension-es2021');
    }).not.toThrow();

    const { modules } = container.extensions['es2021-extension'];
    expect(Object.keys(modules)).toEqual(
      expect.arrayContaining([
        'es2021-extension/src/lib/actions/customCode.js',
        'es2021-extension/src/lib/helpers/logger.js'
      ])
    );
  });

  it('scans an extension written with legacy ECMAScript syntax without throwing', () => {
    let container;
    expect(() => {
      container = runAugment('extension-legacy-ecmascript');
    }).not.toThrow();

    const { modules } = container.extensions['legacy-extension'];
    expect(Object.keys(modules)).toEqual(
      expect.arrayContaining([
        'legacy-extension/src/lib/actions/customCode.js',
        'legacy-extension/src/lib/helpers/logger.js'
      ])
    );
  });
});
