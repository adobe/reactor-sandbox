/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

/* eslint-disable max-len */

module.exports = (request) => {
  console.log(request);

  return {
    header: {
      createdAt: 1607056246918
    },
    body: {
      status: [
        ['RLa88d1c6db2134f968b4a72defa3b4f58', 'success'],
        ['RLa09304df9c9a4ff493daca1b56175775', 'success']
      ],
      traces: [
        {
          name: 'evaluatingRule',
          timestampMs: 1607056246918,
          attributes: {
            logLevel: 'log'
          },
          messages: ['🚀', 'Rule "R1" is being executed.'],
          context: {
            ruleId: 'RLa88d1c6db2134f968b4a72defa3b4f58'
          }
        },
        {
          name: 'evaluatingRule',
          timestampMs: 1607056246920,
          attributes: {
            logLevel: 'log'
          },
          messages: [
            '🚀',
            'Calling "Send Data" module from the "Adobe Cloud Connector" extension.',
            'Event: ',
            '{"xdm":{"eventType":"display","web":{"webPageDetails":{"URL":"https://alloystore.dev/"},"webReferrer":{"URL":""}},"device":{"screenHeight":1050,"screenWidth":1680,"screenOrientation":"landscape"},"environment":{"type":"browser","browserDetails":{"viewportWidth":1680,"viewportHeight":421}},"placeContext":{"localTime":"2020-11-17T14:49:24.196-07:00","localTimezoneOffset":420},"timestamp":"2020-11-17T21:49:24.197Z","implementationDetails":{"name":"https://ns.adobe.com/experience/alloy/reactor","version":"2.3.0+2.2.0","environment":"browser"}},"data":{"performance":{"timeOrigin":1605649762275.786,"timing":{"connectStart":1605649762293,"navigationStart":1605649762275,"loadEventEnd":1605649763990,"domLoading":1605649762598,"secureConnectionStart":0,"fetchStart":1605649762293,"domContentLoadedEventStart":1605649763141,"responseStart":1605649762587,"responseEnd":1605649762589,"domInteractive":1605649763141,"domainLookupEnd":1605649762293,"redirectStart":0,"requestStart":1605649762295,"unloadEventEnd":1605649762595,"unloadEventStart":1605649762595,"domComplete":1605649763944,"domainLookupStart":1605649762293,"loadEventStart":1605649763944,"domContentLoadedEventEnd":1605649763142,"redirectEnd":0,"connectEnd":1605649762293},"navigation":{"type":1,"redirectCount":0}}}}',
            'Rule Stash: ',
            '{}'
          ],
          context: {
            ruleId: 'RLa88d1c6db2134f968b4a72defa3b4f58'
          }
        },
        {
          name: 'evaluatingRule',
          timestampMs: 1607056247388,
          attributes: {
            logLevel: 'log'
          },
          messages: [
            '🚀',
            'FETCH',
            'Resource',
            'https://webhook.site/1611904d-afff-48c6-8a16-84d486154e36',
            'Options',
            '{"method":"POST","body":"{\\"header\\":{\\"requestId\\":\\"123\\",\\"adobeAepValidationToken\\":\\"123\\"},\\"body\\":{\\"xdm\\":{\\"eventType\\":\\"display\\",\\"web\\":{\\"webPageDetails\\":{\\"URL\\":\\"https://alloystore.dev/\\"},\\"webReferrer\\":{\\"URL\\":\\"\\"}},\\"device\\":{\\"screenHeight\\":1050,\\"screenWidth\\":1680,\\"screenOrientation\\":\\"landscape\\"},\\"environment\\":{\\"type\\":\\"browser\\",\\"browserDetails\\":{\\"viewportWidth\\":1680,\\"viewportHeight\\":421}},\\"placeContext\\":{\\"localTime\\":\\"2020-11-17T14:49:24.196-07:00\\",\\"localTimezoneOffset\\":420},\\"timestamp\\":\\"2020-11-17T21:49:24.197Z\\",\\"implementationDetails\\":{\\"name\\":\\"https://ns.adobe.com/experience/alloy/reactor\\",\\"version\\":\\"2.3.0+2.2.0\\",\\"environment\\":\\"browser\\"}},\\"data\\":{\\"performance\\":{\\"timeOrigin\\":1605649762275.786,\\"timing\\":{\\"connectStart\\":1605649762293,\\"navigationStart\\":1605649762275,\\"loadEventEnd\\":1605649763990,\\"domLoading\\":1605649762598,\\"secureConnectionStart\\":0,\\"fetchStart\\":1605649762293,\\"domContentLoadedEventStart\\":1605649763141,\\"responseStart\\":1605649762587,\\"responseEnd\\":1605649762589,\\"domInteractive\\":1605649763141,\\"domainLookupEnd\\":1605649762293,\\"redirectStart\\":0,\\"requestStart\\":1605649762295,\\"unloadEventEnd\\":1605649762595,\\"unloadEventStart\\":1605649762595,\\"domComplete\\":1605649763944,\\"domainLookupStart\\":1605649762293,\\"loadEventStart\\":1605649763944,\\"domContentLoadedEventEnd\\":1605649763142,\\"redirectEnd\\":0,\\"connectEnd\\":1605649762293},\\"navigation\\":{\\"type\\":1,\\"redirectCount\\":0}}}}}","headers":{}}',
            'Response Status',
            '200',
            'Response Body',
            'empty'
          ],
          context: {
            ruleId: 'RLa88d1c6db2134f968b4a72defa3b4f58'
          }
        },
        {
          name: 'evaluatingRule',
          timestampMs: 1607056247389,
          attributes: {
            logLevel: 'log'
          },
          messages: [
            '🚀',
            '"Send Data" module from the "Adobe Cloud Connector" extension returned.',
            'Output:',
            '{"responses":{}}'
          ],
          context: {
            ruleId: 'RLa88d1c6db2134f968b4a72defa3b4f58'
          }
        },
        {
          name: 'evaluatingRule',
          timestampMs: 1607056246919,
          attributes: {
            logLevel: 'log'
          },
          messages: ['🚀', 'Rule "R2" is being executed.'],
          context: {
            ruleId: 'RLa09304df9c9a4ff493daca1b56175775'
          }
        },
        {
          name: 'evaluatingRule',
          timestampMs: 1607056246921,
          attributes: {
            logLevel: 'log'
          },
          messages: [
            '🚀',
            'Calling "Custom Code" module from the "Core" extension.',
            'Event: ',
            '{"xdm":{"eventType":"display","web":{"webPageDetails":{"URL":"https://alloystore.dev/"},"webReferrer":{"URL":""}},"device":{"screenHeight":1050,"screenWidth":1680,"screenOrientation":"landscape"},"environment":{"type":"browser","browserDetails":{"viewportWidth":1680,"viewportHeight":421}},"placeContext":{"localTime":"2020-11-17T14:49:24.196-07:00","localTimezoneOffset":420},"timestamp":"2020-11-17T21:49:24.197Z","implementationDetails":{"name":"https://ns.adobe.com/experience/alloy/reactor","version":"2.3.0+2.2.0","environment":"browser"}},"data":{"performance":{"timeOrigin":1605649762275.786,"timing":{"connectStart":1605649762293,"navigationStart":1605649762275,"loadEventEnd":1605649763990,"domLoading":1605649762598,"secureConnectionStart":0,"fetchStart":1605649762293,"domContentLoadedEventStart":1605649763141,"responseStart":1605649762587,"responseEnd":1605649762589,"domInteractive":1605649763141,"domainLookupEnd":1605649762293,"redirectStart":0,"requestStart":1605649762295,"unloadEventEnd":1605649762595,"unloadEventStart":1605649762595,"domComplete":1605649763944,"domainLookupStart":1605649762293,"loadEventStart":1605649763944,"domContentLoadedEventEnd":1605649763142,"redirectEnd":0,"connectEnd":1605649762293},"navigation":{"type":1,"redirectCount":0}}}}',
            'Rule Stash: ',
            '{}'
          ],
          context: {
            ruleId: 'RLa09304df9c9a4ff493daca1b56175775'
          }
        },
        {
          name: 'evaluatingRule',
          timestampMs: 1607056246922,
          attributes: {
            logLevel: 'log'
          },
          messages: [
            '🚀',
            '"Custom Code" module from the "Core" extension returned.',
            'Output:',
            '{"customCode":{"f":5}}'
          ],
          context: {
            ruleId: 'RLa09304df9c9a4ff493daca1b56175775'
          }
        }
      ]
    }
  };
};
