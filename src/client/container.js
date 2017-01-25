'use strict';

module.exports = {
  rules: [
    // Set up rules that you would like to test. modulePath is the name of your
    // extension (as defined in your extension.json) plus the path to the library module file.

    // {
    //   name: 'Example Rule',
    //   events: [
    //     {
    //       // This is a simple event type provided by the sandbox which triggers the rule when
    //       // you click anywhere on the document. Another option is sandbox/pageTop.js which is
    //       // an event type which triggers the rule as soon as the DTM library is loaded.
    //       // This event type is provided as a convenience in case your extension does not have
    //       // event types of its own.
    //       modulePath: 'sandbox/click.js',
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
    // Set up data elements that you would like to test. modulePath is the name of your
    // extension (as defined in your extension.json) plus the path to the library module file.

    // myDataElement: {
    //   modulePath: 'example-extension/src/lib/dataElements/javascriptVariable.js',
    //   settings: {}
    // }
  },
  extensions: {
    // Set up an extension configuration you would like to test. The key is the name of your
    // extension (as defined in your extension.json).

    // 'example-extension': {
    //   displayName: 'Example Extension',
    //   settings: {}
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
