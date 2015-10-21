'use strict';

(function() {
  window.extensionBridge = {
    validate: null,
    getConfig: null,
    setConfig: null
  };

  var channel = Channel.build({
    window: parent,
    origin: '*',
    scope: 'activation'
  });

  channel.bind('validate', function() {
    return window.extensionBridge.validate();
  });

  channel.bind('getConfig', function() {
    return window.extensionBridge.getConfig();
  });

  channel.bind('setConfig', function(transaction, config) {
    window.extensionBridge.setConfig(config);
  });
})();
