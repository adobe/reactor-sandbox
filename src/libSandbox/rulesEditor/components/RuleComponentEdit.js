import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Map, List } from 'immutable';
import './ComponentEditSidebar.css';
import ComponentIframe from './ComponentIframe';
import Backdrop from './Backdrop';
import basePath from '../helpers/basePath';

const isNewComponent = (componentId, type, currentRule) =>
  componentId === 'new' || componentId >= (currentRule.get(type) || List()).size;

const getCurrentRule = (currentRule, rules, ruleId) => {
  let rule;

  if (currentRule && currentRule.get('id') === ruleId) {
    rule = currentRule;
  } else {
    rule = (rules || List()).get(ruleId) || Map();
  }
  rule = rule.set('id', ruleId);
  return rule;
};

const getComponent = ({
  match: {
    params: { type, component_id: componentId, rule_id: ruleId }
  },
  rules,
  currentRule
}) => {
  const rule = getCurrentRule(currentRule, rules, ruleId);
  return (
    rule.getIn([type, componentId]) ||
    Map({
      modulePath: '',
      settings: null
    })
  );
};

class RuleComponentEdit extends Component {
  constructor(props) {
    super(props);

    const currentRule = getCurrentRule(props.currentRule, props.rules, props.match.params.rule_id);

    this.state = {
      errors: {},
      waitingForExtensionResponse: false,
      component: getComponent(props),
      currentRule
    };

    props.setCurrentRule(currentRule);
  }

  handleComponentTypeChange = (event) => {
    const { component } = this.state;

    this.setState({
      component: component.merge({
        settings: null,
        modulePath: event.target.value
      })
    });
  };

  handleOrderChange = (event) => {
    const { component } = this.state;
    const {
      target: { value }
    } = event;

    const newComponent = component.set('order', value);
    this.setState({ component: newComponent });
  };

  handleSave = () => {
    if (!this.isValid()) {
      return false;
    }

    const { component } = this.state;

    const {
      addComponent,
      saveComponent,
      match: {
        params: { component_id: componentId, type }
      },
      currentIframe,
      history
    } = this.props;

    const { currentRule } = this.state;

    const method = isNewComponent(componentId, type, currentRule) ? addComponent : saveComponent;

    this.setState({
      waitingForExtensionResponse: true
    });

    currentIframe.promise
      .then((api) => Promise.all([api.validate(), api.getSettings()]))
      .then(([isValid, settings]) => {
        if (isValid) {
          method({
            id: componentId,
            type,
            component: component.merge({ settings })
          });

          history.push(this.backLink());
        } else {
          this.setState({
            waitingForExtensionResponse: false
          });
        }
      });

    return true;
  };

  componentList() {
    const {
      match: {
        params: { type }
      },
      registry
    } = this.props;
    const componentList = {};
    const groupList = [];

    (registry.getIn(['components', type]) || List()).valueSeq().forEach((v) => {
      if (!componentList[v.get('extensionDisplayName')]) {
        componentList[v.get('extensionDisplayName')] = [];
      }
      componentList[v.get('extensionDisplayName')].push(
        <option
          value={`${v.get('extensionName')}/${v.get('libPath')}`}
          key={`optionType${v.get('libPath')}`}
        >
          {v.get('displayName')}
        </option>
      );
    });

    Object.keys(componentList).forEach((extenisonDisplayName) => {
      groupList.push(
        <optgroup key={`optGroupExtension${extenisonDisplayName}`} label={extenisonDisplayName}>
          {componentList[extenisonDisplayName]}
        </optgroup>
      );
    });

    return groupList;
  }

  isValid() {
    const errors = {};
    const { component } = this.state;

    if (!component.get('modulePath')) {
      errors.modulePath = true;
    }

    this.setState({ errors });
    return Object.keys(errors).length === 0;
  }

  backLink() {
    const {
      match: {
        params: { rule_id: ruleId }
      }
    } = this.props;

    return `${basePath}/rules/${ruleId}`;
  }

  render() {
    const { waitingForExtensionResponse, component, errors } = this.state;
    const {
      match: {
        params: { type }
      },
      registry,
      extensionConfigurations
    } = this.props;

    const componentIframeDetails = registry.getIn([
      'components',
      type,
      component.get('modulePath')
    ]);

    const extensionName = component.get('modulePath').split('/')[0];

    return (
      <div className="pure-g component-edit-container">
        {waitingForExtensionResponse ? (
          <Backdrop message="Waiting for the extension response..." />
        ) : null}
        <div className="pure-u-1-4">
          <div className="component-edit-sidebar">
            <form className="pure-form pure-form-stacked">
              <fieldset>
                <h4>Component Details</h4>
                <label htmlFor="componentType">
                  <span>Type</span>
                  <select
                    id="componentType"
                    className={errors.modulePath ? 'border-error' : ''}
                    value={component.get('modulePath')}
                    onChange={this.handleComponentTypeChange}
                  >
                    <option value="">Please select...</option>
                    {this.componentList()}
                  </select>
                </label>
                <br />

                <label htmlFor="order">
                  <span>Order</span>
                  <input
                    id="order"
                    type="text"
                    value={component.get('order') || '50'}
                    onChange={this.handleOrderChange}
                  />
                </label>
              </fieldset>
            </form>

            <div className="button-container">
              <button
                type="button"
                className="pure-button-primary pure-button"
                onClick={this.handleSave}
              >
                Save
              </button>
              &nbsp;
              <Link to={this.backLink()} className="pure-button">
                Cancel
              </Link>
            </div>
          </div>
        </div>
        <div className="pure-u-3-4">
          <ComponentIframe
            component={componentIframeDetails}
            extensionConfiguration={extensionConfigurations
              .filter((i) => i.get('name') === extensionName)
              .first()}
            settings={component.get('settings')}
            server={registry.getIn(['environment', 'server'])}
          />
        </div>
      </div>
    );
  }
}

const mapState = (state) => {
  return {
    rules: state.rules,
    currentRule: state.currentRule,
    currentIframe: state.currentIframe,
    registry: state.registry,
    extensionConfigurations: state.extensionConfigurations
  };
};

const mapDispatch = ({
  rules: { saveRule },
  currentRule: { setCurrentRule, saveComponent, addComponent }
}) => ({
  saveRule: (payload) => saveRule(payload),
  setCurrentRule: (payload) => setCurrentRule(payload),
  saveComponent: (payload) => saveComponent(payload),
  addComponent: (payload) => addComponent(payload)
});

export default withRouter(connect(mapState, mapDispatch)(RuleComponentEdit));
