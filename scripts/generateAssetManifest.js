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

const fs = require('fs');
const path = require('path');

const buildDir = path.resolve(__dirname, '../build');
const staticDir = path.join(buildDir, 'static');
const manifest = {};

function walk(dir) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filepath = path.join(dir, file);
    const stat = fs.statSync(filepath);
    if (stat.isDirectory()) {
      walk(filepath);
    } else {
      const relPath = path.relative(buildDir, filepath).replace(/\\/g, '/');
      if (file.endsWith('.js')) manifest['main.js'] = relPath;
      if (file.endsWith('.css')) manifest['main.css'] = relPath;
      if (file.endsWith('.map') && file.includes('.js')) manifest['main.js.map'] = relPath;
      if (file.endsWith('.map') && file.includes('.css')) manifest['main.css.map'] = relPath;
      if (file.endsWith('.LICENSE.txt')) manifest['main.js.LICENSE.txt'] = relPath;
    }
  });
}

walk(staticDir);

// Add top-level files
['favicon.ico', 'manifest.json', 'index.html'].forEach((name) => {
  const filePath = path.join(buildDir, name);
  if (fs.existsSync(filePath)) {
    manifest[name] = name;
  }
});

// Add extensionbridge-child.js
const extBridgePath = path.join(buildDir, 'extensionbridge/extensionbridge-child.js');
if (fs.existsSync(extBridgePath)) {
  manifest['extensionbridge/extensionbridge-child.js'] = 'extensionbridge/extensionbridge-child.js';
}

fs.writeFileSync(path.join(buildDir, 'asset-manifest.json'), JSON.stringify(manifest, null, 2));
console.log('asset-manifest.json generated.');
