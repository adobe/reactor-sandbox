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
// scans it for relative require() calls.
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

  it('allows a top-level return since turbine wraps modules in a function', () => {
    const { modules } = runAugment('extension-top-level-return').extensions[
      'top-level-return-extension'
    ];
    expect(Object.keys(modules).sort()).toEqual([
      'top-level-return-extension/src/lib/actions/earlyExit.js',
      'top-level-return-extension/src/lib/helpers/logger.js'
    ]);
  });

  it('produces a wrapped module script that compiles and runs with a top-level return', () => {
    const { modules } = runAugment('extension-top-level-return').extensions[
      'top-level-return-extension'
    ];
    const script = modules['top-level-return-extension/src/lib/actions/earlyExit.js'].script;

    const moduleFn = new Function(`return ${script.toString()}`)();
    const module = { exports: {} };
    const require = () => ({ log: () => {} });

    expect(() => moduleFn(module, module.exports, require, {})).not.toThrow();
    expect(typeof module.exports).toBe('function');
  });

  it('follows require() calls written as backtick strings without placeholders', () => {
    const { modules } = runAugment('extension-template-literal-require').extensions[
      'template-literal-extension'
    ];
    expect(Object.keys(modules).sort()).toEqual([
      'template-literal-extension/src/lib/actions/customCode.js',
      'template-literal-extension/src/lib/helpers/logger.js'
    ]);
  });

  it('includes the module path when a module has a syntax error', () => {
    const modulePath = path.join(FIXTURES_DIR, 'extension-syntax-error/src/lib/actions/broken.js');
    let error;
    try {
      runAugment('extension-syntax-error');
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.message).toContain(modulePath);
    expect(error.cause).toBeInstanceOf(SyntaxError);
  });

  it('rejects ES module syntax and includes the module path', () => {
    const modulePath = path.join(FIXTURES_DIR, 'extension-esm/src/lib/actions/esm.js');
    expect(() => runAugment('extension-esm')).toThrow(modulePath);
  });

  it('handles circular and self requires without overflowing the stack', () => {
    const { modules } = runAugment('extension-circular').extensions['circular-extension'];
    expect(Object.keys(modules).sort()).toEqual([
      'circular-extension/src/lib/actions/a.js',
      'circular-extension/src/lib/actions/b.js',
      'circular-extension/src/lib/actions/self.js'
    ]);
    expect(modules['circular-extension/src/lib/actions/a.js']).toMatchObject({
      name: 'a',
      displayName: 'A'
    });
    expect(modules['circular-extension/src/lib/actions/self.js'].name).toBe('self');
  });

  it('ignores requires in comments, strings, dynamic paths, and non-relative packages', () => {
    const { modules } = runAugment('extension-ignored-requires').extensions[
      'ignored-requires-extension'
    ];
    expect(Object.keys(modules).sort()).toEqual([
      'ignored-requires-extension/src/lib/actions/ignored.js',
      'ignored-requires-extension/src/lib/helpers/logger.js'
    ]);
  });

  it('resolves extensionless, .js, and parent-directory requires to reference paths', () => {
    const { modules } = runAugment('extension-resolution').extensions['resolution-extension'];
    expect(Object.keys(modules).sort()).toEqual([
      'resolution-extension/src/lib/actions/nested/a.js',
      'resolution-extension/src/lib/actions/nested/b.js',
      'resolution-extension/src/lib/actions/nested/entry.js',
      'resolution-extension/src/lib/shared/c.js'
    ]);
  });

  it('reads a module required from multiple places within one delegate only once', () => {
    const fs = require('fs');
    const readSpy = jest.spyOn(fs, 'readFileSync');
    const dPath = path.join(FIXTURES_DIR, 'extension-diamond/src/lib/helpers/d.js');

    try {
      const { modules } = runAugment('extension-diamond').extensions['diamond-extension'];
      expect(Object.keys(modules).sort()).toEqual([
        'diamond-extension/src/lib/actions/top.js',
        'diamond-extension/src/lib/helpers/b.js',
        'diamond-extension/src/lib/helpers/c.js',
        'diamond-extension/src/lib/helpers/d.js'
      ]);
      expect(readSpy.mock.calls.filter(([file]) => file === dPath)).toHaveLength(1);
    } finally {
      readSpy.mockRestore();
    }
  });

  it('merges shared module meta into a module that was first reached via require', () => {
    const { modules } = runAugment('extension-meta-merge').extensions['meta-merge-extension'];
    expect(modules['meta-merge-extension/src/lib/actions/a.js']).toMatchObject({
      name: 'a',
      displayName: 'A'
    });
    expect(modules['meta-merge-extension/src/lib/helpers/h.js']).toMatchObject({
      name: 'h',
      shared: true
    });
  });
});
