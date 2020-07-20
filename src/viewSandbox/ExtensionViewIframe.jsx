import { useState, useEffect } from 'react';
import { ERROR_CODES, loadIframe } from '@adobe/reactor-bridge';
import defaultOpenCodeEditor from '../client/src/openCodeEditor';
import defaultOpenRegexTester from '../client/src/openRegexTester';
import defaultOpenDataElementSelector from '../client/src/openDataElementSelector';

export default function ExtensionViewIframe(props) {
  const {
    src,
    initInfo,
    openCodeEditor = defaultOpenCodeEditor,
    openRegexTester = defaultOpenRegexTester,
    openDataElementSelector = defaultOpenDataElementSelector,
    onFrameLoaded,
    onFrameFailure,
    forwardRef: parentContainerRef
  } = props;

  const [bridge, setBridge] = useState(null);

  useEffect(() => {
    if (bridge?.destroy) {
      bridge.destroy();
    }
    parentContainerRef.current.innerHTML = '';

    const iframe = document.createElement('iframe');
    iframe.src = src;
    iframe.setAttribute(
      'sandbox',
      'allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts'
    );

    const newBridge = loadIframe({
      iframe,
      extensionInitOptions: initInfo,
      openCodeEditor,
      openRegexTester,
      openDataElementSelector
    });

    setBridge(newBridge);
    parentContainerRef.current.appendChild(iframe);

    newBridge.promise.then(onFrameLoaded).catch((error) => {
      if (error !== ERROR_CODES.DESTROYED) {
        onFrameFailure(error);
      }
    });
  }, [src]);

  return null;
}
