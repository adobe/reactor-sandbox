/* eslint-disable import/no-extraneous-dependencies */
import js from '@eslint/js';
import babelEslintParser from '@babel/eslint-parser';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import prettierPlugin from 'eslint-plugin-prettier';
import importPlugin from 'eslint-plugin-import';
import globals from 'globals'; // ✅ NEW: brings in node/browser globals

export default [
  js.configs.recommended,

  {
    ignores: [
      'src/client/initFiles/container.js',
      '*.css',
      '*.html',
      'node_modules/',
      'build/',
      'dist/',
      'public/'
    ]
  },

  {
    languageOptions: {
      parser: babelEslintParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          presets: ['@babel/preset-react']
        },
        ecmaVersion: 2021,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
          classes: true,
          spread: true,
          arrowFunctions: true
        }
      },
      globals: {
        ...globals.node, // ✅ Enables Node.js globals like require, module, etc.
        ...globals.browser, // ✅ Adds browser globals like window, document, console
        Simulate: 'readonly',
        TestPage: 'readonly',
        runTestPage: 'readonly',
        _satellite: 'readonly',
        CodeMirror: 'readonly',
        extensionDescriptor: 'readonly'
      }
    },

    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'jsx-a11y': jsxA11yPlugin,
      prettier: prettierPlugin,
      import: importPlugin
    },

    rules: {
      'prettier/prettier': 'error',
      'react/prop-types': 'off',
      'react/jsx-filename-extension': 'off',
      'jsx-a11y/label-has-for': 'off',
      camelcase: ['error', { properties: 'always' }],
      indent: 'off',
      semi: ['error', 'always'],
      'keyword-spacing': 'error',
      'space-before-function-paren': [
        'error',
        {
          anonymous: 'always',
          named: 'never',
          asyncArrow: 'always'
        }
      ],
      'space-before-blocks': ['error', 'always'],
      'space-infix-ops': ['error', { int32Hint: false }],
      quotes: ['warn', 'single', { avoidEscape: true }],
      'max-len': ['error', { code: 100, tabWidth: 4 }],
      eqeqeq: ['error', 'allow-null'],
      strict: ['error', 'global'],
      'no-nested-ternary': 'error',
      'no-underscore-dangle': 'off',
      'comma-style': 'error',
      'one-var': ['error', 'never'],
      'brace-style': ['error', '1tbs', { allowSingleLine: true }],
      'consistent-this': 'off',
      'spaced-comment': 'off',
      'no-param-reassign': 'off',
      'prefer-const': ['error', { destructuring: 'all' }],
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react/function-component-definition': 'off',
      'react/destructuring-assignment': 'off',
      'no-restricted-exports': 'off',
      'import/prefer-default-export': 'off',
      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: ['**/*.test.js', '**/__tests__/**', 'src/tasks/**']
        }
      ]
    },

    settings: {
      react: {
        version: 'detect'
      }
    }
  }
];
