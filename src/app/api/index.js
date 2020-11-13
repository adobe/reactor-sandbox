/* eslint-disable import/prefer-default-export */

const fetchJson = (endpoint) => fetch(endpoint).then((response) => response.json());

export const getExtensionDescriptorFromApi = () => {
  return fetchJson(`${window.EXPRESS_PUBLIC_URL}/extensionDescriptor`);
};
