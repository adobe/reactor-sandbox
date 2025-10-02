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

// eslint-disable-next-line header/header,import/no-extraneous-dependencies
import { defineConfig } from 'vite';
// eslint-disable-next-line import/no-extraneous-dependencies
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  publicDir: 'public',
  build: {
    outDir: 'build', // output to build/
    emptyOutDir: true,
    assetsDir: 'static', // static assets folder
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'),
      output: {
        entryFileNames: 'static/js/main.[hash].js',
        chunkFileNames: 'static/js/[name].[hash].js',
        assetFileNames: ({ name }) => {
          if (name && name.endsWith('.css')) {
            return 'static/css/main.[hash][extname]';
          }
          if (name && name.endsWith('.js')) {
            return 'static/js/main.[hash][extname]';
          }
          if (name && name.endsWith('.map')) {
            if (name.includes('.css')) {
              return 'static/css/main.[hash][extname]';
            }
            if (name.includes('.js')) {
              return 'static/js/main.[hash][extname]';
            }
          }
          if (name && name.endsWith('.LICENSE.txt')) {
            return 'static/js/main.[hash][extname]';
          }
          return 'static/media/[name].[hash][extname]';
        }
      }
    }
  }
});
