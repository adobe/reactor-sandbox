module.exports = {
  rules: [
    // Set up rules that you would like to test. For each event/condition/action:
    //  - modulePath is the name of your extension (as defined in your extension.json) plus the
    //    path to the library module file.
    //  - settings is an object containing user input saved from your extension view.
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
    // Set up data elements that you would like to test. The top-level object keys are the data
    // element names. For each data element:
    //  - modulePath is the name of your extension (as defined in your extension.json) plus the
    //    path to the library module file.
    //  - settings is an object containing user input saved from your extension view.
    // productId: {
    //   // This is a simple data element type provided by the sandbox which retrieves a value
    //   // from local storage. This data element type is provided as a convenience in case
    //   // your extension does not have any data element types of its own.
    //   modulePath: 'sandbox/localStorage.js',
    //   settings: {
    //     // The local storage item name.
    //     name: 'productId'
    //   }
    // }
  },
  extensions: {
    // Set up an extension configuration you would like to test. The top-level object key is the
    // name of your extension (as defined in your extension.json).
    // 'example-extension': {
    //   displayName: 'Example Extension',
    //   settings: {}
    // }
  },
  company: {
    id: 'CO12345',
    orgId: 'ABCDEFGHIJKLMNOPQRSTUVWX@AdobeOrg',
    tenantId: 'fake-tenant-id'
  },
  property: {
    name: 'Sandbox property',
    settings: {
      id: 'PR12345',
      domains: ['adobe.com', 'example.com'],
      undefinedVarsReturnEmpty: false
    }
  },
  buildInfo: {
    turbineVersion: '27.2.0',
    turbineBuildDate: '2021-08-11T20:25:49Z',
    buildDate: '2022-01-01T12:10:33Z',
    environment: 'development' // deprecated, use environment block instead
  },
  environment: {
    id: 'EN00000000000000000000000000000000',
    stage: 'development'
  }
};
