import { useState, useEffect } from 'react';
import { ERROR_CODES, loadIframe } from '@adobe/reactor-bridge';
import defaultOpenCodeEditor from '../extensionBridgeComponents/openCodeEditor';
import defaultOpenRegexTester from '../extensionBridgeComponents/openRegexTester';
import defaultOpenDataElementSelector from '../extensionBridgeComponents/openDataElementSelector';
import reportIframeComError from './helpers/reportIframeComError';
import getDefaultInitInfo from './helpers/getDefaultInitInfo';

const buildExtensionViewUrl = ({ extensionDescriptor, selectedDescriptor: { descriptor } }) => {
  let src;

  if (descriptor.viewPath) {
    src =
      `${window.EXPRESS_PUBLIC_URL}/extensionViews/${extensionDescriptor.name}/` +
      `${extensionDescriptor.version}/${descriptor.viewPath}`;
  } else {
    src = `${window.EXPRESS_PUBLIC_URL}/noConfigIFrame.html`;
  }

  return src;
};

export default function ExtensionViewIframe({
  selectedDescriptor,
  extensionDescriptor,
  parentContainerRef
}) {
  const [bridge, setBridge] = useState(null);

  useEffect(() => {
    const { type: descriptorType = null, descriptor = null } = selectedDescriptor;
    if (!descriptorType || !descriptor) {
      return;
    }

    if (bridge?.destroy) {
      bridge.destroy();
    }

    // eslint-disable-next-line no-param-reassign
    parentContainerRef.current.innerHTML = '';

    const iframe = document.createElement('iframe');
    iframe.src = buildExtensionViewUrl({ selectedDescriptor, extensionDescriptor });
    iframe.setAttribute(
      'sandbox',
      'allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts'
    );

    const newBridge = loadIframe({
      iframe,
      extensionInitOptions: getDefaultInitInfo(selectedDescriptor),
      openCodeEditor: defaultOpenCodeEditor,
      openRegexTester: defaultOpenRegexTester,
      openDataElementSelector: defaultOpenDataElementSelector
    });

    setBridge(newBridge);

    parentContainerRef.current.appendChild(iframe);

    newBridge.promise.catch((error) => {
      if (error !== ERROR_CODES.DESTROYED) {
        reportIframeComError(error);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDescriptor, extensionDescriptor]);

  return null;
}
