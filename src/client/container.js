'use strict';

module.exports = {
  rules: [
    // {
    //   name: 'Example Rule',
    //   events: [
    //     {
    //       modulePath: 'exampleExtension/src/lib/eventDelegates/click.js',
    //       settings: {}
    //     }
    //   ],
    //   conditions: [
    //     {
    //       modulePath: 'exampleExtension/src/lib/conditions/operatingSystem.js',
    //       settings: {}
    //     }
    //   ],
    //   actions: [
    //     {
    //       modulePath: 'exampleExtension/src/lib/actions/sendBeacon.js',
    //       settings: {}
    //     }
    //   ]
    // }
  ],
  dataElements: {
    // myDataElement: {
    //   modulePath: 'exampleExtension/src/lib/dataElements/javascriptVariable.js',
    //   settings: {}
    // }
  },
  extensions: {
    // exampleExtension: {
    //   displayName: 'Example Extension',
    //   configurations: {
    //     ECa: {
    //       settings: {}
    //     }
    //   },
    //   // This will be populated automatically based on features found in extension.json.
    //   modules: {
    //     'exampleExtension/src/lib/events/click.js': {
    //       displayName: 'Click',
    //       script: function(module, require) {}
    //     },
    //     'exampleExtension/src/lib/conditions/operatingSystem.js': {
    //       displayName: 'Operating System',
    //       script: function(module, require) {}
    //     },
    //     'exampleExtension/src/lib/actions/sendBeacon.js': {
    //       displayName: 'Send Beacon',
    //       script: function(module, require) {}
    //     },
    //     'exampleExtension/src/lib/dataElements/javascriptVariable.js': {
    //       displayName: 'JavaScript Variable',
    //       script: function(module, require) {}
    //     },
    //     'exampleExtension/src/lib/sharedModules/myExampleModule.js': {
    //       sharedName: 'myExampleModule',
    //       script: function(module, require) {}
    //     }
    //   }
    // }
  },
  propertySettings: {
    domains: [
      'adobe.com',
      'example.com'
    ],
    linkDelay: 100,
    euCookieName: 'sat_track',
    undefinedVarsReturnEmpty: false
  },
  buildInfo: {
    turbineVersion: '14.0.0',
    turbineBuildDate: '2016-07-01T18:10:34Z',
    buildDate: '2016-08-01T12:10:33Z',
    environment: 'development'
  }
};
