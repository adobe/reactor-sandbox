'use strict';

(function() {
  var getChannel = function(iframe) {
    if (!iframe.__extensionChannel) {
      iframe.__extensionChannel = Channel.build({
        window: iframe.contentWindow,
        origin: '*',
        scope: 'activation'
      });
    }

    return iframe.__extensionChannel;
  };

  window.extensionBridge = {
    validate: function(iframe, callback) {
      getChannel(iframe).call({
        method: 'validate',
        success: callback,
        error: function(error) {
          console.error('An error occurred while validating.', error);
        }
      });
    },
    getConfig: function(iframe, callback) {
      getChannel(iframe).call({
        method: 'getConfig',
        success: callback,
        error: function(error) {
          console.error('An error occurred while getting config.', error);
        }
      });
    },
    setConfig: function(iframe, config) {
      getChannel(iframe).notify({
        method: 'setConfig',
        params: config,
        error: function(error) {
          console.error('An error occurred while getting config.', error);
        }
      });
    }
  };
})();
