import { loadIframe } from '@adobe/reactor-bridge';
import defaultOpenCodeEditor from '../extensionBridgeComponents/openCodeEditor';
import defaultOpenRegexTester from '../extensionBridgeComponents/openRegexTester';
import defaultOpenDataElementSelector from '../extensionBridgeComponents/openDataElementSelector';

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

export default ({
  selectedDescriptor,
  extensionDescriptor,
  parentContainerRef,
  openCodeEditor = defaultOpenCodeEditor,
  openRegexTester = defaultOpenRegexTester,
  openDataElementSelector = defaultOpenDataElementSelector,
  initInfo = {}
}) => {
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
    extensionInitOptions: initInfo,
    openCodeEditor,
    openRegexTester,
    openDataElementSelector: openDataElementSelector(extensionDescriptor)
  });

  id += 1;
  newBridge.id = id;

  parentContainerRef.current.appendChild(iframe);

  return newBridge;
};
