'use strict';

module.exports = {
  rules: [
    // {
    //   name: 'Example Rule',
    //   events: [
    //     {
    //       modulePath: 'example-extension/src/lib/events/click.js',
    //       settings: {}
    //     }
    //   ],
    //   conditions: [
    //     {
    //       modulePath: 'example-extension/src/lib/conditions/operatingSystem.js',
    //       settings: {}
    //     }
    //   ],
    //   actions: [
    //     {
    //       modulePath: 'example-extension/src/lib/actions/sendBeacon.js',
    //       settings: {}
    //     }
    //   ]
    // }
  ],
  dataElements: {
    // myDataElement: {
    //   modulePath: 'example-extension/src/lib/dataElements/javascriptVariable.js',
    //   settings: {}
    // }
  },
  extensions: {
    // 'example-extension': {
    //   displayName: 'Example Extension',
    //   configurations: [
    //     {
    //       id: 'ECa',
    //       name: 'Extension Configuration Name',
    //       settings: {}
    //     }
    //   ]
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
