'use strict';

module.exports = {
  rules: [
    {
      name: 'Example Rule',
      events: [
        {
          modulePath: 'exampleExtension/src/lib/eventDelegates/click.js',
          settings: {}
        }
      ],
      conditions: [
        {
          modulePath: 'exampleExtension/src/lib/conditions/operatingSystem.js',
          settings: {}
        }
      ],
      actions: [
        {
          modulePath: 'exampleExtension/src/lib/actions/sendBeacon.js',
          settings: {}
        }
      ]
    }
  ],
  dataElements: {
    myDataElement: {
      modulePath: 'exampleExtension/src/lib/dataElements/javascriptVariable.js',
      settings: {}
    }
  },
  extensions: {
    exampleExtension: {
      displayName: 'Example Extension',
      configurations: {
        ECa: {
          settings: {}
        }
      },
      modules: {
        'exampleExtension/src/lib/events/click.js': {
          displayName: 'Click',
          script: function(module, require) {}
        },
        'exampleExtension/src/lib/conditions/operatingSystem.js': {
          displayName: 'Operating System',
          script: function(module, require) {}
        },
        'exampleExtension/src/lib/actions/sendBeacon.js': {
          displayName: 'Send Beacon',
          script: function(module, require) {}
        },
        'exampleExtension/src/lib/dataElements/javascriptVariable.js': {
          displayName: 'JavaScript Variable',
          script: function(module, require) {}
        },
        'exampleExtension/src/lib/sharedModules/myExampleModule.js': {
          sharedName: 'myExampleModule',
          script: function(module, require) {}
        }
      }
    }
  },
  propertySettings: {},
  buildInfo: {
    appVersion: '52A',
    buildDate: '2015-03-16 20:55:42 UTC',
    publishDate: '2015-03-16 14:43:44 -0600',
    environment: 'development',
    hostedFilesBaseUrl: '//example.com/files/'
  }
};
