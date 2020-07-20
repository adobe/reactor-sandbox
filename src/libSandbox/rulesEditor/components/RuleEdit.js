import React, { Component } from 'react';
import './RuleEdit.css';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { List, Map } from 'immutable';
import { withLastLocation } from 'react-router-last-location';
import RuleComponentsList from './RuleComponentsList';
import basePath from '../helpers/basePath';

const isNewRule = ({
  match: {
    params: { rule_id: ruleId }
  },
  rules
}) => {
  return ruleId === 'new' || !rules || ruleId >= rules.size;
};

// Need to check from where the user is coming. If he returns from a rule
// component edit view, we need to load the currentRule from the state.
// We need to check the location once for every page load of this view.
let locationChecked = false;
const checkLastLocation = (location) => {
  if (locationChecked) {
    return true;
  }

  locationChecked = true;

  if (!location) {
    return false;
  }

  return location.pathname.match(/\/rules\/.*\/(:?events|conditions|actions)\/.*$/);
};

const getCurrentRule = (props) => {
  const ruleId = props.match.params.rule_id;
  let rule;

  let { currentRule } = props;
  if (!checkLastLocation(props.lastLocation)) {
    currentRule = null;
  }

  if (currentRule && currentRule.get('id') === ruleId) {
    rule = currentRule;
  } else {
    rule = (props.rules || List()).get(ruleId) || Map();
  }

  rule = rule.set('id', ruleId);
  return rule;
};

class RuleEdit extends Component {
  static backLink() {
    return `${basePath}/rules/`;
  }

  constructor(props) {
    super(props);

    this.state = {
      rule: getCurrentRule(props),
      errors: {}
    };
  }

  componentWillUnmount() {
    locationChecked = false;
  }

  handleSave = () => {
    if (!this.isValid()) {
      return false;
    }

    const {
      addRule,
      saveRule,
      match: {
        params: { rule_id: ruleId }
      },
      setCurrentRule,
      history
    } = this.props;

    const { rule } = this.state;
    const method = isNewRule(this.props) ? addRule : saveRule;

    method({
      id: ruleId,
      rule
    });

    setCurrentRule(null);
    history.push(this.constructor.backLink());

    return true;
  };

  handleNameChange = (event) => {
    const { rule } = this.state;
    const { setCurrentRule } = this.props;
    const newRule = rule.set('name', event.target.value);

    setCurrentRule(newRule);
    this.setState({ rule: newRule });
  };

  handleCancelClick = () => {
    const { setCurrentRule } = this.props;
    setCurrentRule(null);
  };

  handleDeleteClick = (type, index) => {
    const { setCurrentRule } = this.props;
    const { rule } = this.state;
    const newRule = rule.deleteIn([type, index]);

    setCurrentRule(newRule);
    this.setState({ rule: newRule });
  };

  isValid() {
    const errors = {};
    const { rule } = this.state;

    if (!rule.get('name')) {
      errors.name = true;
    }

    this.setState({ errors });
    return Object.keys(errors).length === 0;
  }

  render() {
    const { rule, errors } = this.state;
    return (
      <div className="pure-g container">
        <div className="pure-u-1-1">
          <form className="pure-form">
            <fieldset>
              <legend>
                <strong>{isNewRule(this.props) ? 'Create' : 'Edit'} Rule</strong>
              </legend>
              <input
                type="text"
                className={errors.name ? 'border-error' : ''}
                placeholder="Rule name"
                value={rule.get('name') || ''}
                onChange={this.handleNameChange}
              />
            </fieldset>
          </form>
          <div className="component-group">
            <strong>Events</strong>
            <RuleComponentsList
              handleDeleteClick={this.handleDeleteClick}
              items={rule.get('events') || List()}
              type="events"
            />
          </div>
          <div className="component-group">
            <strong>Conditions</strong>
            <RuleComponentsList
              handleDeleteClick={this.handleDeleteClick}
              items={rule.get('conditions') || List()}
              type="conditions"
            />
          </div>
          <div className="component-group">
            <strong>Actions</strong>
            <RuleComponentsList
              handleDeleteClick={this.handleDeleteClick}
              items={rule.get('actions') || List()}
              type="actions"
            />
          </div>
          <div className="button-container">
            <button
              type="button"
              onClick={this.handleSave}
              className="pure-button-primary pure-button"
            >
              Save
            </button>
            &nbsp;
            <Link
              onClick={this.handleCancelClick}
              to={this.constructor.backLink()}
              className="pure-button"
            >
              Cancel
            </Link>
          </div>
        </div>
      </div>
    );
  }
}

const mapState = (state) => {
  return {
    currentRule: state.currentRule,
    rules: state.rules
  };
};

const mapDispatch = ({ rules: { saveRule, addRule }, currentRule: { setCurrentRule } }) => ({
  addRule: (payload) => addRule(payload),
  saveRule: (payload) => saveRule(payload),
  setCurrentRule: (payload) => setCurrentRule(payload)
});

export default withRouter(connect(mapState, mapDispatch)(withLastLocation(RuleEdit)));
