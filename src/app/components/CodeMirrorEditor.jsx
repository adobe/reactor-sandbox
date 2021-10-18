/*
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import React from 'react';
import { basicSetup, EditorView, EditorState } from '@codemirror/basic-setup';
import { linter, openLintPanel } from '@codemirror/lint';
import { gutter, GutterMarker } from '@codemirror/gutter';
import { jsonParseLinter, json } from '@codemirror/lang-json';

const errorMarker = new (class extends GutterMarker {
  // eslint-disable-next-line class-methods-use-this
  toDOM() {
    return document.createTextNode('\u26D4');
  }
})();

const cache = {};
const getCustomLinter = (jsonLinter) => (view) => {
  const docSymbol = Symbol.for(view.state.doc);
  if (!cache[docSymbol]) {
    cache[docSymbol] = jsonLinter(view);
  }

  return cache[docSymbol];
};

const jsonLiner = getCustomLinter(jsonParseLinter());

const errorGutter = gutter({
  lineMarker(view, line) {
    let errorLine = null;
    const [diagnostic] = jsonLiner(view);
    if (diagnostic) {
      errorLine = view.state.doc.lineAt(diagnostic.from);
    }
    return errorLine && line.from === errorLine.from ? errorMarker : null;
  },
  initialSpacer: () => errorMarker
});

const Editor = ({ value = '', onUpdate: onChange = undefined }) => {
  const editor = React.useRef(null);

  React.useEffect(() => {
    const currentEditor = editor.current;

    const extensions = [errorGutter, basicSetup, json(), linter(jsonLiner)];

    if (onChange) {
      extensions.push(EditorView.updateListener.of(onChange));
    }

    const state = EditorState.create({
      doc: value,
      extensions
    });
    const view = new EditorView({ state, parent: currentEditor });
    openLintPanel(view);
    view.focus();

    return () => view.destroy();
  }, [editor, value, onChange]);

  return <div style={{ height: '100%' }} ref={editor} />;
};

export default Editor;
