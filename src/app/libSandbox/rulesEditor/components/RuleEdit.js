import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { List, Map } from 'immutable';
import { View, Heading, Divider, TextField, Button, ButtonGroup } from '@adobe/react-spectrum';
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

  handleNameChange = (name) => {
    const { rule } = this.state;
    const { setCurrentRule } = this.props;
    const newRule = rule.set('name', name);

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
    const { history } = this.props;
    return (
      <>
        <View margin="size-300">
          <Heading level={2}>{isNewRule(this.props) ? 'Create' : 'Edit'} Rule</Heading>
          <Divider />
          <TextField
            label="Rule Name"
            necessityIndicator="label"
            isRequired
            width="size-6000"
            marginTop="size-150"
            validationState={errors.name ? 'invalid' : ''}
            value={rule.get('name') || ''}
            onChange={this.handleNameChange}
          />

          <Heading level={3}>Events</Heading>
          <RuleComponentsList
            addLabel="Add new event"
            handleDeleteClick={this.handleDeleteClick}
            items={rule.get('events') || List()}
            type="events"
          />
          <Heading level={3}>Conditions</Heading>
          <RuleComponentsList
            addLabel="Add new condition"
            handleDeleteClick={this.handleDeleteClick}
            items={rule.get('conditions') || List()}
            type="conditions"
          />
          <Heading level={3}>Actions</Heading>
          <RuleComponentsList
            addLabel="Add new action"
            handleDeleteClick={this.handleDeleteClick}
            items={rule.get('actions') || List()}
            type="actions"
          />
          <Divider marginTop="size-300" />
          <ButtonGroup marginTop="size-150" marginBottom="size-150">
            <Button variant="cta" onPress={this.handleSave}>
              Save rule
            </Button>

            <Button
              variant="secondary"
              onPress={() => {
                this.handleCancelClick();
                history.push(this.constructor.backLink());
              }}
            >
              Cancel
            </Button>
          </ButtonGroup>
        </View>
      </>
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
