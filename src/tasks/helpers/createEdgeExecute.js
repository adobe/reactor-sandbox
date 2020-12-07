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

module.exports = (engine, containerInitFunction, { fetch }) => {
  const executeRules = engine.initialize(containerInitFunction, { fetch });

  return (request) => {
    const {
      header,
      body: { xdm, data }
    } = request;

    const { httpHeaders = {}, receivedAt, dispatchedAt } = header;

    const isDebugEnabled = true;
    const input = { event: { xdm, data }, request };

    const headersForSubrequests = [
      'x-organization-id',
      'x-stack-id',
      'x-property-id',
      'x-environment-id',
      'x-request-id'
    ].reduce((acc, v) => {
      const h = httpHeaders[v];
      if (h) {
        acc[v] = Array.isArray(h) ? h.join(', ') : h;
      }
      return acc;
    }, {});

    // Add timestamps from Konductor to the subrequests headers.
    const dateFormat = 'YYYY-MM-DDTHH:mm:ss.sssZ';
    const extraHeaders = {
      'x-konductor-received-at': receivedAt,
      'x-konductor-dispatched-at': dispatchedAt
    };

    Object.keys(extraHeaders).forEach((key) => {
      const value = extraHeaders[key];

      if (value) {
        try {
          headersForSubrequests[key] = new Date(value).toISOString(dateFormat);
          // eslint-disable-next-line no-empty
        } catch (e) {}
      }
    });

    const result = {
      header: {
        createdAt: Date.now()
      }
    };

    const executeRulesPromise = executeRules(input, {
      isDebugEnabled,
      headersForSubrequests
    });

    if (isDebugEnabled) {
      return executeRulesPromise.then((engineResult) => {
        if (isDebugEnabled) {
          result.body = {
            status: engineResult.reduce((acc, { ruleId, status }) => {
              acc.push([ruleId, status]);
              return acc;
            }, []),
            traces: engineResult.reduce((acc, { logs }) => acc.concat(logs), [])
          };
        }

        return [result];
      });
    }

    return Promise.resolve([result, executeRulesPromise]);
  };
};
