import { ERROR_CODES, loadIframe } from '@adobe/reactor-bridge';
import openCodeEditor from '../extensionBridgeComponents/openCodeEditor';
import openRegexTester from '../extensionBridgeComponents/openRegexTester';
import openDataElementSelector from '../extensionBridgeComponents/openDataElementSelector';
import reportFatalError from '../components/helpers/reportFatalError';

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

let id = 0;

export default ({ selectedDescriptor, extensionDescriptor, parentContainerRef }) => {
  if (!selectedDescriptor || !extensionDescriptor) {
    return null;
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
    openCodeEditor,
    openRegexTester,
    openDataElementSelector
  });

  id += 1;
  newBridge.id = id;

  parentContainerRef.current.appendChild(iframe);

  newBridge.promise.catch((error) => {
    if (error.code !== ERROR_CODES.DESTROYED) {
      reportFatalError(error);
    }
  });

  return newBridge;
};
