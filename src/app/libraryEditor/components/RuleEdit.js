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

import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { List, Map } from 'immutable';
import { View, Heading, Divider, TextField, Button, ButtonGroup } from '@adobe/react-spectrum';
import { useLastLocation } from 'react-router-last-location';
import RuleComponentsList from './RuleComponentsList';
import NAMED_ROUTES from '../../constants';

const isNewRule = ({ ruleId, rules }) => {
  return ruleId === 'new' || !rules || ruleId >= rules.size;
};

const checkLastLocation = (location) => {
  if (!location) {
    return false;
  }

  return location.pathname.match(/\/rules\/.*\/(:?events|conditions|actions)\/.*$/);
};

const getCurrentRule = ({ ruleId, rules, lastLocation, currentRule }) => {
  let rule;

  if (currentRule && currentRule.get('id') === ruleId && checkLastLocation(lastLocation)) {
    rule = currentRule;
  } else {
    rule = (rules || List()).get(ruleId) || Map();
  }

  rule = rule.set('id', ruleId);
  return rule;
};

const backLink = `${NAMED_ROUTES.LIBRARY_EDITOR}/rules/`;

const isValid = ({ rule, setErrors }) => {
  const errors = {};

  if (!rule.get('name')) {
    errors.name = true;
  }

  setErrors(errors);
  return Object.keys(errors).length === 0;
};

const handleSave = ({
  rule,
  rules,
  setErrors,
  addRule,
  saveRule,
  ruleId,
  // eslint-disable-next-line no-unused-vars
  setCurrentRule,
  // eslint-disable-next-line no-unused-vars
  history
}) => {
  if (!isValid({ rule, setErrors })) {
    return false;
  }

  // eslint-disable-next-line no-unused-vars
  const method = isNewRule({ rules, ruleId }) ? addRule : saveRule;

  method({
    id: ruleId,
    rule
  });

  setCurrentRule(null);
  history.push(backLink);

  return true;
};

const handleNameChange = ({ name, rule, setRule, setCurrentRule }) => {
  const newRule = rule.set('name', name);
  setCurrentRule(newRule);
  setRule(newRule);
};

const handleDeleteClick = ({ rule, setCurrentRule, setRule }) => (type, index) => {
  const newRule = rule.deleteIn([type, index]);
  setCurrentRule(newRule);
  setRule(newRule);
};

export default () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const [errors, setErrors] = useState({});
  const lastLocation = useLastLocation();
  const { rule_id: ruleId } = useParams();
  const { currentRule, rules } = useSelector((state) => state);
  const [rule, setRule] = useState(Map());

  useEffect(() => {
    setRule(getCurrentRule({ ruleId, rules, lastLocation, currentRule }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View margin="size-300" width="100%">
      <Heading level={2}>{isNewRule({ ruleId, rules }) ? 'Create' : 'Edit'} Rule</Heading>
      <Divider />
      <TextField
        label="Rule Name"
        necessityIndicator="label"
        isRequired
        width="size-6000"
        marginTop="size-150"
        validationState={errors.name ? 'invalid' : ''}
        value={rule.get('name') || ''}
        onChange={(name) => {
          handleNameChange({
            rule,
            setRule,
            name,
            setCurrentRule: dispatch.currentRule.setCurrentRule
          });
        }}
      />

      <Heading level={3}>Events</Heading>
      <RuleComponentsList
        addLabel="Add new event"
        handleDeleteClick={handleDeleteClick({
          rule,
          setRule,
          setCurrentRule: dispatch.currentRule.setCurrentRule
        })}
        items={rule.get('events') || List()}
        type="events"
      />
      <Heading level={3}>Conditions</Heading>
      <RuleComponentsList
        addLabel="Add new condition"
        handleDeleteClick={handleDeleteClick({
          rule,
          setRule,
          setCurrentRule: dispatch.currentRule.setCurrentRule
        })}
        items={rule.get('conditions') || List()}
        type="conditions"
      />
      <Heading level={3}>Actions</Heading>
      <RuleComponentsList
        addLabel="Add new action"
        handleDeleteClick={handleDeleteClick({
          rule,
          setRule,
          setCurrentRule: dispatch.currentRule.setCurrentRule
        })}
        items={rule.get('actions') || List()}
        type="actions"
      />
      <Divider marginTop="size-300" />
      <ButtonGroup marginTop="size-150" marginBottom="size-150">
        <Button
          variant="cta"
          onPress={() => {
            handleSave({
              ruleId,
              rule,
              rules,
              setErrors,
              history,
              addRule: dispatch.rules.addRule,
              saveRule: dispatch.rules.saveRule,
              setCurrentRule: dispatch.currentRule.setCurrentRule
            });
          }}
        >
          Save rule
        </Button>

        <Button
          variant="secondary"
          onPress={() => {
            dispatch.currentRule.setCurrentRule(null);
            history.push(backLink);
          }}
        >
          Cancel
        </Button>
      </ButtonGroup>
    </View>
  );
};
