'use strict';

module.exports = {
  rules: [
    {
      name: 'Example Rule',
      events: [
        {
          delegateId: 'exampleExtension/events/click',
          settings: {}
        }
      ],
      conditions: [
        {
          delegateId: 'exampleExtension/conditions/operatingSystem',
          settings: {}
        }
      ],
      actions: [
        {
          delegateId: 'exampleExtension/actions/sendBeacon',
          settings: {}
        }
      ]
    }
  ],
  dataElements: {
    myDataElement: {
      delegateId: 'exampleExtension/dataElements/javascriptVariable',
      settings: {}
    }
  },
  extensions: {
    EXa: {
      name: 'exampleExtension',
      displayName: 'Example Extension',
      configurations: {
        ECa: {
          settings: {}
        }
      },
      delegates: {
        'exampleExtension/events/click': {
          displayName: 'Click',
          script: function(module, require) {}
        },
        'exampleExtension/conditions/operatingSystem': {
          displayName: 'Operating System',
          script: function(module, require) {}
        },
        'exampleExtension/actions/sendBeacon': {
          displayName: 'Send Beacon',
          script: function(module, require) {}
        },
        'exampleExtension/dataElements/javascriptVariable': {
          displayName: 'JavaScript Variable',
          script: function(module, require) {}
        }
      },
      resources: {
        'exampleExtension/resources/myExampleResource': {
          script: function(module, require) {}
        }
      }
    }
  },
  propertySettings: {},
  appVersion: '52A',
  buildDate: '2015-03-16 20:55:42 UTC',
  publishDate: '2015-03-16 14:43:44 -0600'
};
