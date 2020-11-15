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

/* eslint-disable react/jsx-no-bind */

import React, { Component } from 'react';
import { List } from 'immutable';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { View, Heading, Divider, TextField, Button } from '@adobe/react-spectrum';
import basePath from '../helpers/basePath';

class PropertySettings extends Component {
  constructor(props) {
    super(props);

    this.state = {
      propertySettings: props.propertySettings.set(
        'domains',
        props.propertySettings.get('domains').toJS().join(', ')
      ),
      errors: {}
    };
  }

  handleDomainsChange(domains) {
    const { propertySettings } = this.state;

    this.setState({
      propertySettings: propertySettings.set('domains', domains)
    });
  }

  handleSave() {
    if (!this.isValid()) {
      return false;
    }

    const { propertySettings } = this.state;
    const { setPropertySettings, history } = this.props;

    setPropertySettings(
      propertySettings.set(
        'domains',
        List(
          propertySettings
            .get('domains')
            .split(',')
            .map((s) => s.trim())
        )
      )
    );

    history.push(basePath);

    return true;
  }

  isValid() {
    const errors = {};
    const { propertySettings } = this.state;

    if (!propertySettings.get('domains')) {
      errors.domains = true;
    }

    this.setState({ errors });
    return Object.keys(errors).length === 0;
  }

  render() {
    const { errors, propertySettings } = this.state;
    return (
      <View margin="size-300" width="size-6000" alignSelf="center">
        <Heading level={2}>Property Settings</Heading>
        <Divider />
        <TextField
          label="Domains List"
          necessityIndicator="label"
          isRequired
          width="size-6000"
          marginTop="size-150"
          validationState={errors.domains ? 'invalid' : ''}
          value={propertySettings.get('domains')}
          onChange={this.handleDomainsChange.bind(this)}
        />
        <Heading level={6} margin="size-100">
          Comma separated values are accepted.
        </Heading>
        <Button variant="cta" marginTop="size-100" onPress={this.handleSave.bind(this)}>
          Save
        </Button>
      </View>
    );
  }
}

const mapState = (state) => ({
  propertySettings: state.propertySettings
});

const mapDispatch = ({ propertySettings: { setPropertySettings } }) => ({
  setPropertySettings: (payload) => setPropertySettings(payload)
});

export default withRouter(connect(mapState, mapDispatch)(PropertySettings));
