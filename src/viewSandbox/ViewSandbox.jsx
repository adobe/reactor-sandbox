import React, { useState, useReducer, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Controlled as CodeMirror } from 'react-codemirror2';
import Split from 'split.js';
import deepEqual from 'deep-equal';
import indexBy from '@ramda/indexby';
import Ajv from 'ajv';
import { Item } from '@adobe/react-spectrum';
import { Tabs } from '@react-spectrum/tabs';
import NAMED_ROUTES from '../constants';
import ExtensionViewIframe from './ExtensionViewIframe';
import { getExtensionDescriptorFromApi } from '../api';

require('codemirror/mode/javascript/javascript.js');
require('codemirror/lib/codemirror.css');
require('codemirror/theme/material.css');
require('codemirror/theme/neat.css');
require('codemirror/mode/xml/xml.js');
require('codemirror/addon/lint/lint');
require('codemirror/addon/lint/json-lint');
require('codemirror/addon/lint/lint.css');
require('../client/public/viewSandbox.css');

window.JSHINT = require('jshint').JSHINT;
window.jsonlint = require('jsonlint-mod').parser;

const LOG_PREFIX = 'reactor-sandbox:';

const VIEW_GROUPS = {
  CONFIGURATION: 'configuration',
  EVENTS: 'events',
  CONDITIONS: 'conditions',
  ACTIONS: 'actions',
  DATA_ELEMENTS: 'dataElements'
};

const viewGroupOptionDescriptors = [
  {
    value: VIEW_GROUPS.CONFIGURATION,
    label: 'Extension Configuration'
  },
  {
    value: VIEW_GROUPS.EVENTS,
    label: 'Events'
  },
  {
    value: VIEW_GROUPS.CONDITIONS,
    label: 'Conditions'
  },
  {
    value: VIEW_GROUPS.ACTIONS,
    label: 'Actions'
  },
  {
    value: VIEW_GROUPS.DATA_ELEMENTS,
    label: 'Data Elements'
  }
];

const SETTINGS_LABEL_DEFAULT = 'Validate & Get Settings';
const SETTINGS_LABEL_ASYNC = 'Awaiting Settings';
const VALIDATE_LABEL_DEFAULT = 'Validate';
const VALIDATE_LABEL_ASYNC = 'Awaiting Validate';
const VALIDATION_ERROR = 'error';
const VALIDATION_SUCCESS = 'success';
const NOT_AVAILABLE = '--N/A--';
const OTHER = 'Other';

const codeMirrorInitialState = {
  value: '{}',
  persistentValue: '{}',
  isDirty: false,
  options: {
    lineNumbers: true,
    mode: 'application/json',
    gutters: ['CodeMirror-lint-markers'],
    lint: true,
    extraKeys: {
      Tab: (cm) => {
        cm.replaceSelection('  ', 'end');
      }
    }
  }
};

const cmDispatchActions = {
  INITIALIZE: 'cmDispatch/INITIALIZE',
  USER_UPDATE_VALUE: 'cmDispatch/USER_UPDATE_VALUE',
  SET_PERSISTENT_VALUE: 'cmDispatch/SET_PERSISTENT_VALUE',
  SYNC_VALUE_AND_PERSISTENT_VALUE: 'cmDispatch/SYNC_VALUE_AND_PERSISTENT_VALUE'
};
function codeMirrorReducer(state, action) {
  switch (action.type) {
    case cmDispatchActions.INITIALIZE:
      return codeMirrorInitialState;
    case cmDispatchActions.USER_UPDATE_VALUE:
      return {
        ...state,
        value: action.value,
        isDirty: true
      };
    case cmDispatchActions.SET_PERSISTENT_VALUE:
      return {
        ...state,
        persistentValue: action.value,
        isDirty: true
      };
    case cmDispatchActions.SYNC_VALUE_AND_PERSISTENT_VALUE:
      return {
        ...state,
        value: action.value,
        persistentValue: action.value,
        isDirty: false
      };
    default:
      return state;
  }
}

const reportIframeComError = (error) => {
  // eslint-disable-next-line no-alert
  alert('An error has occurred. Please see the browser console.');
  throw error;
};

const Validation = ({ type = VALIDATION_ERROR, children: validationError }) => (
  <div className={`validation ${type}`}>
    <span>{validationError}</span>
  </div>
);

const logMessage = (...args) => {
  // eslint-disable-next-line no-console
  console.log(args);
};

let extensionViewDescriptorsByValue = {};

export default function ViewSandbox() {
  const [selectedViewGroup, setSelectedViewGroup] = useState('');
  const [viewGroupOptions, setViewGroupOptions] = useState([]);
  const [selectedExtensionView, setSelectedExtensionView] = useState('');
  const [extensionViewOptions, setExtensionViewOptions] = useState([]);
  const [selectedExtensionViewIframeUrl, setExtensionViewIframeUrl] = useState(undefined);
  const [cmInitPanelState, cmInitPanelDispatch] = useReducer(
    codeMirrorReducer,
    codeMirrorInitialState
  );
  const [cmSettingsPanelState, cmSettingsPanelDispatch] = useReducer(
    codeMirrorReducer,
    codeMirrorInitialState
  );
  const [validation, setValidation] = useState(null);
  const [extensionView, setExtensionView] = useState();
  const [isGettingSettings, setIsGettingSettings] = useState(false);
  const [settingsButtonLabel, setSettingsButtonLabel] = useState(SETTINGS_LABEL_DEFAULT);
  const [isValidating, setIsValidating] = useState(false);
  const [validationButtonLabel, setValidationButtonLabel] = useState(VALIDATE_LABEL_DEFAULT);
  const [selectedTab, setSelectedTab] = useState('init');
  const iframeRef = useRef();
  const [extensionDescriptor, setExtensionDescriptor] = useState({});

  const getCategorizedItems = (items) => {
    const groupedItems = {};

    if (items) {
      items.forEach((item) => {
        const categoryName = item.categoryName || NOT_AVAILABLE;
        if (!groupedItems[categoryName]) {
          groupedItems[categoryName] = [];
        }
        groupedItems[categoryName].push(item);
      });
    }
    Object.keys(groupedItems).forEach((categoryName) => {
      groupedItems[categoryName].sort((a, b) => {
        return a.displayName > b.displayName;
      });
    });

    return groupedItems;
  };

  const populateExtensionViewSelector = (value) => {
    localStorage.setItem('lastSelectedViewGroup', value);

    if (value === VIEW_GROUPS.CONFIGURATION) {
      const extConfiguration = extensionDescriptor[VIEW_GROUPS.CONFIGURATION];
      if (extConfiguration) {
        setSelectedExtensionView(extConfiguration.viewPath);
        extensionViewDescriptorsByValue[extConfiguration.viewPath] = extConfiguration;
      }

      return;
    }

    let newSelectedExtensionView = '';
    const categorizedItems = getCategorizedItems(extensionDescriptor[value]);

    const sortedCategories = Object.keys(categorizedItems).sort((a, b) => {
      const categoriesToBePlacedLast = [NOT_AVAILABLE, OTHER];
      for (let i = 0; i < categoriesToBePlacedLast.length; i += 1) {
        if (a === categoriesToBePlacedLast[i] || b === categoriesToBePlacedLast[i]) {
          return a === categoriesToBePlacedLast[i] ? 1 : -1;
        }
      }

      return a.localeCompare(b);
    });
    const items = sortedCategories.map((categoryName) => {
      extensionViewDescriptorsByValue = {
        ...extensionViewDescriptorsByValue,
        ...indexBy((item) => item.viewPath, categorizedItems[categoryName] || [])
      };
      const categoryItems = categorizedItems[categoryName].map((item) => {
        return (
          <option key={`${item.viewPath}-${item.displayName}`} value={item.viewPath}>
            {item.displayName}
          </option>
        );
      });

      if (categoryName !== NOT_AVAILABLE) {
        return (
          <optgroup key={categoryName} label={categoryName}>
            {categoryItems}
          </optgroup>
        );
      }

      return categoryItems;
    });

    setExtensionViewOptions(items);
    if (items.length) {
      const [firstCategory] = sortedCategories;
      const [firstCategoryItem] = categorizedItems[firstCategory];
      newSelectedExtensionView = firstCategoryItem.viewPath;
    }

    setSelectedExtensionView(newSelectedExtensionView);
  };

  const changeViewGroupSelector = (viewGroup) => {
    setSelectedViewGroup(viewGroup);
    populateExtensionViewSelector(viewGroup);
  };

  const getDefaultInitInfo = () => {
    const selectedExtensionViewDescriptor = extensionViewDescriptorsByValue[selectedExtensionView];

    const info = {
      settings: null,
      propertySettings: {
        domains: ['adobe.com', 'example.com'],
        linkDelay: 100,
        trackingCookieName: 'sat_track',
        undefinedVarsReturnEmpty: false
      },
      tokens: {
        imsAccess: 'X34DF56GHHBBFFGH'
      },
      company: {
        orgId: 'ABCDEFGHIJKLMNOPQRSTUVWX@AdobeOrg'
      },
      schema: selectedExtensionViewDescriptor?.schema || null
    };

    if (selectedViewGroup !== VIEW_GROUPS.CONFIGURATION) {
      info.extensionSettings = {
        foo: 'bar'
      };
    }

    return info;
  };

  /**
   * @returns {string} Uniquely identifies a view. Views with the same name
   * but different type (condition types vs action type) will have different
   * identifiers. The same view in two different versions of the same extension
   * will have different identifiers. A view with the same name and view
   * path across different extensions will also have different identifiers.
   */
  const getSelectedViewIdentifier = () => {
    const viewDescriptor = extensionViewDescriptorsByValue[selectedExtensionView];
    return viewDescriptor && viewDescriptor.viewPath
      ? `${extensionDescriptor.name}/${extensionDescriptor.version}/${viewDescriptor.viewPath}`
      : null;
  };

  const getCachedInitInfo = () => {
    const infoCache = JSON.parse(localStorage.getItem('initInfo') || '{}');
    const viewId = getSelectedViewIdentifier();
    return viewId ? infoCache[viewId] : null;
  };

  const setCachedInitInfo = (initInfo) => {
    const infoCache = JSON.parse(localStorage.getItem('initInfo') || '{}');
    const viewId = getSelectedViewIdentifier();

    if (viewId) {
      infoCache[viewId] = initInfo;
      localStorage.setItem('initInfo', JSON.stringify(infoCache));
    }
  };

  /**
   * Grabs the current value of the init panel and sends it to the init function of the extension.
   */
  const initExtensionView = () => {
    const initInfo = JSON.parse(cmInitPanelState.value || '{}');
    const defaultInfo = getDefaultInitInfo();

    if (!deepEqual(initInfo, defaultInfo)) {
      setCachedInitInfo(initInfo);
    }

    logMessage(`${LOG_PREFIX} init() with`, cmInitPanelState.value);
    extensionView
      .init(initInfo)
      .then(() => setValidation(null))
      .catch(reportIframeComError);
  };

  /**
   * Resets the init panel back to the default info.
   */
  const resetInitExtensionView = () => {
    const defaultInfo = getDefaultInitInfo();

    setCachedInitInfo(null);
    cmInitPanelDispatch({
      type: cmDispatchActions.USER_UPDATE_VALUE,
      value: JSON.stringify(defaultInfo, null, 2)
    });

    logMessage(`${LOG_PREFIX} init() with`, defaultInfo);
    extensionView
      .init(defaultInfo)
      .then(() => setValidation(null))
      .catch(reportIframeComError);
  };

  /**
   * Forces the contents of the settings panel into the init panel's settings object.
   */
  const copySettingsToInit = () => {
    const initContent = JSON.parse(cmInitPanelState.value);
    initContent.settings = JSON.parse(cmSettingsPanelState.value || '{}');

    cmInitPanelDispatch({
      type: cmDispatchActions.SYNC_VALUE_AND_PERSISTENT_VALUE,
      value: JSON.stringify(initContent, null, 2)
    });

    setValidation(null);
  };

  const loadSelectedViewIntoIframe = () => {
    const defaultInitInfo = getDefaultInitInfo();
    const cachedInitInfo = getCachedInitInfo();

    let initInfo;

    if (cachedInitInfo && !deepEqual(cachedInitInfo, defaultInitInfo)) {
      initInfo = cachedInitInfo;
    } else {
      initInfo = defaultInitInfo;
    }

    cmInitPanelDispatch({
      type: cmDispatchActions.USER_UPDATE_VALUE,
      value: JSON.stringify(initInfo, null, 2)
    });

    setValidation(null);
    let src;
    if (extensionViewDescriptorsByValue[selectedExtensionView]?.viewPath) {
      src =
        `${window.EXPRESS_PUBLIC_URL}/extensionViews/${extensionDescriptor.name}/` +
        `${extensionDescriptor.version}/${selectedExtensionView}`;
    } else {
      src = `${window.EXPRESS_PUBLIC_URL}/noConfigIFrame.html`;
    }
    setExtensionViewIframeUrl(src);
  };

  /**
   * Calls validate for the extension view & validates the current view's schema against the
   * returned value of a extensionView.getSettings call.
   * @returns {Promise<void>}
   */
  const reportValidation = async() => {
    setIsValidating(true);

    const timeoutId = setTimeout(() => {
      setValidationButtonLabel(VALIDATE_LABEL_ASYNC);
    }, 500);

    const loadSchema = (uri) => fetch(uri).then((response) => response.json());

    try {
      const isValid = await extensionView.validate();
      const selectedViewDescriptor = extensionViewDescriptorsByValue[selectedExtensionView];
      const SCHEMA_REQUIRED_ERROR = 'Schema not defined in your extension.json but is required.';

      if (isValid) {
        if (selectedViewDescriptor?.schema) {
          const settings = await extensionView.getSettings();
          logMessage(`${LOG_PREFIX} getSettings() returned`, settings);

          const ajv = Ajv({
            loadSchema,
            schemaId: 'auto'
          });
          // eslint-disable-next-line global-require
          ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'));

          const validateFunc = await ajv.compileAsync(selectedViewDescriptor.schema);
          const matchesSchema = validateFunc(settings);

          if (matchesSchema) {
            setValidation({ type: VALIDATION_SUCCESS, message: 'Valid' });
          } else {
            setValidation({
              type: VALIDATION_ERROR,
              message:
                'Settings object does not match schema. Ensure result of getSettings() ' +
                ' is correct.'
            });
          }
        } else {
          setValidation({
            type: VALIDATION_ERROR,
            message: SCHEMA_REQUIRED_ERROR
          });
        }
      } else {
        let message = 'View reported Invalid.';
        if (!selectedViewDescriptor?.schema) {
          message += ` ${SCHEMA_REQUIRED_ERROR}`;
        }
        setValidation({
          type: VALIDATION_ERROR,
          message
        });
      }
    } catch (e) {
      reportIframeComError(e);
    } finally {
      clearTimeout(timeoutId);
      setIsValidating(false);
      setValidationButtonLabel(VALIDATE_LABEL_DEFAULT);
    }
  };

  const getSettings = async() => {
    setIsGettingSettings(true);

    const timeoutId = setTimeout(() => {
      // only report if it takes longer than half a second to retrieve
      setSettingsButtonLabel(SETTINGS_LABEL_ASYNC);
    }, 50);

    // reporting the validation during getSettings will help inform developers of their problems
    await reportValidation();

    extensionView
      .getSettings()
      .then((settings) => {
        clearTimeout(timeoutId);
        setSettingsButtonLabel(SETTINGS_LABEL_DEFAULT);
        logMessage(`${LOG_PREFIX} getSettings() returned`, settings);
        cmSettingsPanelDispatch({
          type: cmDispatchActions.USER_UPDATE_VALUE,
          value: JSON.stringify(settings, null, 2)
        });
      })
      .catch((error) => {
        logMessage(`${LOG_PREFIX} getSettings() errored`, error);
        return reportIframeComError(error);
      })
      .finally(() => {
        setIsGettingSettings(false);
      });
  };

  // init
  useEffect(() => {
    getExtensionDescriptorFromApi().then((extensionDescriptorResult) => {
      setExtensionDescriptor(extensionDescriptorResult);

      const options = viewGroupOptionDescriptors.reduce((allOptions, { label, value }) => {
        if (!Object.prototype.hasOwnProperty.call(extensionDescriptorResult, value)) {
          return allOptions;
        }

        const items = extensionDescriptorResult[value] || [];
        // extension configuration is an object, so make an option for it if it exists.
        if (value === VIEW_GROUPS.CONFIGURATION || (Array.isArray(items) && items.length)) {
          return allOptions.concat(
            <option key={label} value={value}>
              {label}
            </option>
          );
        }

        return allOptions;
      }, []);

      setViewGroupOptions(options);

      if (options.length) {
        changeViewGroupSelector(options[0].props.value);
      }

      Split(['#extensionViewPane', '#controlPane'], {
        minSize: 0,
        sizes: [65, 35]
      });
    });
  }, []);

  useEffect(() => {
    localStorage.setItem('lastSelectedExtensionView', selectedExtensionView);
    loadSelectedViewIntoIframe();
  }, [selectedExtensionView]);

  let canReset;
  try {
    // if the contents of the initPanel are ever not the same as the defaultInfo, we can reset
    canReset = !deepEqual(JSON.parse(cmInitPanelState.value), getDefaultInitInfo());
  } catch (e) {
    // there was an error, assume it's a parse error and we can reset
    canReset = true;
  }

  // render
  return (
    <div id="content">
      <Link
        className="nav spectrum-Button spectrum-Button--secondary spectrum-Button--quiet"
        to={NAMED_ROUTES.LIB_SANDBOX}
      >
        Go to library sandbox
      </Link>
      <a href={`${window.EXPRESS_PUBLIC_URL}/libSandbox.html`}>Legacy Lib Sandbox</a>

      <h1 className="spectrum-Body1">Reactor Extension View Sandbox</h1>

      <div className="spectrum-Body5">
        Select View:
        <select
          id="viewGroupSelector"
          value={selectedViewGroup}
          onChange={(e) => {
            changeViewGroupSelector(e.target.value);
          }}
        >
          {viewGroupOptions}
        </select>
        {selectedViewGroup !== VIEW_GROUPS.CONFIGURATION && (
          <select
            id="extensionViewSelector"
            value={selectedExtensionView}
            onChange={(e) => {
              setSelectedExtensionView(e.target.value);
            }}
          >
            {extensionViewOptions}
          </select>
        )}
      </div>

      <div id="panesWrapper">
        <div id="panes">
          <div id="extensionViewPane" ref={iframeRef}>
            <ExtensionViewIframe
              viewPath={selectedExtensionView}
              src={selectedExtensionViewIframeUrl}
              onFrameLoaded={(extView) => {
                setExtensionView(extView);
              }}
              onFrameFailure={reportIframeComError}
              forwardRef={iframeRef}
            />
          </div>
          <div id="controlPane">
            <Tabs selectedKey={selectedTab} onSelectionChange={setSelectedTab}>
              <Item title="Init" key="init">
                <div className="editorContainer">
                  <CodeMirror
                    className="codeMirror-Wrapper"
                    value={cmInitPanelState.value}
                    options={cmInitPanelState.options}
                    onBeforeChange={(editor, data, value) => {
                      cmInitPanelDispatch({
                        type: cmDispatchActions.USER_UPDATE_VALUE,
                        value
                      });
                    }}
                    onChange={(editor, data, value) => {
                      cmInitPanelDispatch({
                        type: cmDispatchActions.USER_UPDATE_VALUE,
                        value
                      });
                    }}
                  />
                </div>
                <div className="panelButtonHolder">
                  <button
                    type="button"
                    id="initButton"
                    className="spectrum-Button spectrum-Button--primary panelButton"
                    onClick={initExtensionView}
                  >
                    Init
                  </button>
                  <button
                    type="button"
                    id="resetInitButton"
                    className="spectrum-Button spectrum-Button--primary panelButton resetInitButton"
                    disabled={!canReset}
                    onClick={resetInitExtensionView}
                  >
                    Reset
                  </button>
                </div>
              </Item>
              <Item title="Get Settings" key="settings">
                <div className="panelButtonHolder">
                  <button
                    type="button"
                    id="getSettingsButton"
                    className="spectrum-Button spectrum-Button--primary panelButton"
                    onClick={getSettings}
                    disabled={isGettingSettings}
                  >
                    {settingsButtonLabel}
                  </button>
                </div>
                {validation?.message?.length > 0 && (
                  <Validation type={validation.type}>{validation.message}</Validation>
                )}
                <div className="editorContainer">
                  <CodeMirror
                    className="codeMirror-Wrapper"
                    value={cmSettingsPanelState.value}
                    options={cmSettingsPanelState.options}
                    onBeforeChange={null} // do nothing
                    onChange={null} // do nothing
                  />
                </div>
                <div className="panelButtonHolder">
                  <button
                    type="button"
                    id="copySettingsToInitButton"
                    className="spectrum-Button spectrum-Button--primary panelButton"
                    onClick={copySettingsToInit}
                    disabled={isGettingSettings}
                  >
                    Copy Settings to Init Panel
                  </button>
                </div>
              </Item>
              <Item title="Validate" key="validate">
                <div className="panelButtonHolder">
                  <button
                    type="button"
                    id="validateButton"
                    className="spectrum-Button spectrum-Button--primary panelButton"
                    onClick={reportValidation}
                    disabled={isValidating}
                  >
                    {validationButtonLabel}
                  </button>
                </div>
                {validation?.message?.length > 0 && (
                  <Validation type={validation.type}>{validation.message}</Validation>
                )}
              </Item>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
