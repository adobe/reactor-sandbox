const extensionDescriptorPaths = require('./extensionDescriptorPaths');
const path = require('path');

module.exports = () => {
  // We have all the logic inside the function because we want to give
  // the most current data from inside the descriptors each time the function is called.
  const extensionDescriptors = {};

  extensionDescriptorPaths.forEach(extensionDescriptorPath => {
    extensionDescriptorPath = path.resolve(extensionDescriptorPath);
    delete require.cache[extensionDescriptorPath];

    const extensionDescriptor = require(extensionDescriptorPath);
    extensionDescriptor.extensionDescriptorPath = extensionDescriptorPath;
    extensionDescriptors[extensionDescriptor.name] = extensionDescriptor;
  });

  return extensionDescriptors;
};
