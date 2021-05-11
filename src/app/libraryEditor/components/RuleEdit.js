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

import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import produce from 'immer';
import { useDispatch, useSelector } from 'react-redux';
import { View, Heading, Divider, TextField, Button, ButtonGroup } from '@adobe/react-spectrum';
import { useLastLocation } from 'react-router-last-location';
import RuleComponentsList from './RuleComponentsList';
import { NAMED_ROUTES } from '../../constants';
import { PLATFORMS } from '../../../helpers/sharedConstants';
import ErrorMessage from '../../components/ErrorMessage';
import ExtensionDescriptorContext from '../../extensionDescriptorContext';

const isNewRule = ({ ruleId, rules }) => {
  return ruleId === 'new' || !rules || ruleId >= rules.length;
};

const isUserComingFromRuleComponentsPage = (location) => {
  if (!location) {
    return false;
  }

  return Boolean(location.pathname.match(/\/rules\/.*\/(:?events|conditions|actions)\/.*$/));
};

const getRule = ({ ruleId, rules }) => {
  const rule = (rules || [])[ruleId];

  if (!rule) {
    return {
      ruleId,
      id: `RL${Date.now()}`,
      name: ''
    };
  }

  return {
    ...rule,
    ruleId: Number(ruleId)
  };
};

const backLink = `${NAMED_ROUTES.LIBRARY_EDITOR}/rules/`;

const isValid = ({ rule, setErrors }) => {
  const errors = {};

  if (!rule.name) {
    errors.name = true;
  }

  setErrors(errors);
  return Object.keys(errors).length === 0;
};

const handleSave = async ({ rule, saveMethod, setErrors, setCurrentRule, history }) => {
  if (!isValid({ rule, setErrors })) {
    return false;
  }

  try {
    await saveMethod(rule);
    setCurrentRule(null);
    history.push(backLink);
  } catch (e) {
    setErrors({ api: e.message });
  }

  return true;
};

const handleNameChange = ({ name, rule, setRule, setCurrentRule }) => {
  const newRule = produce(rule, (draft) => {
    draft.name = name;
  });
  setCurrentRule(newRule);
  setRule(newRule);
};

const handleDeleteClick = ({ rule, setCurrentRule, setRule }) => (type, index) => {
  const newRule = produce(rule, (draft) => {
    draft[type].splice(index, 1);
  });
  setCurrentRule(newRule);
  setRule(newRule);
};

export default () => {
  const extensionDescriptor = useContext(ExtensionDescriptorContext);
  const dispatch = useDispatch();
  const history = useHistory();
  const { rule_id: ruleId } = useParams();

  const [errors, setErrors] = useState({});
  const lastLocation = useLastLocation();
  const { currentRule, rules } = useSelector((state) => state);
  const [rule, setRule] = useState({});

  const saveMethod = useMemo(() => {
    const { addAndSaveToContainer, updateAndSaveToContainer } = dispatch.rules;
    return isNewRule({ ruleId, rules }) ? addAndSaveToContainer : updateAndSaveToContainer;
  }, [dispatch.rules, ruleId, rules]);

  useEffect(() => {
    if (isUserComingFromRuleComponentsPage(lastLocation)) {
      setRule(currentRule);
    } else {
      const r = getRule({ ruleId, rules });
      dispatch.currentRule.setCurrentRule(r);
      setRule(r);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return errors.api ? (
    <View flex>
      <ErrorMessage message={errors.api} />
    </View>
  ) : (
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
        value={rule.name || ''}
        onChange={(name) => {
          handleNameChange({
            rule,
            setRule,
            name,
            setCurrentRule: dispatch.currentRule.setCurrentRule
          });
        }}
      />

      {extensionDescriptor.platform !== PLATFORMS.EDGE && (
        <>
          <Heading level={3}>Events</Heading>
          <RuleComponentsList
            addLabel="Add new event"
            handleDeleteClick={handleDeleteClick({
              rule,
              setRule,
              setCurrentRule: dispatch.currentRule.setCurrentRule
            })}
            items={rule.events || []}
            type="events"
          />
        </>
      )}

      <Heading level={3}>Conditions</Heading>
      <RuleComponentsList
        addLabel="Add new condition"
        handleDeleteClick={handleDeleteClick({
          rule,
          setRule,
          setCurrentRule: dispatch.currentRule.setCurrentRule
        })}
        items={rule.conditions || []}
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
        items={rule.actions || []}
        type="actions"
      />
      <Divider marginTop="size-300" />
      <ButtonGroup marginTop="size-150" marginBottom="size-150">
        <Button
          variant="cta"
          onPress={() => {
            handleSave({
              rule,
              saveMethod,
              history,
              setErrors,
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
