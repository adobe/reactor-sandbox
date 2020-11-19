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

/* eslint-disable jsx-a11y/label-has-associated-control */

import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { View, Heading, Divider, TextField, Button, Flex } from '@adobe/react-spectrum';
import NAMED_ROUTES from '../../constants';

class OtherSettings extends Component {
  constructor(props) {
    super(props);

    this.state = {
      companySettings: props.companySettings,
      otherSettings: props.otherSettings,
      errors: {}
    };
  }

  handleOrgIdChange = (orgId) => {
    const { companySettings } = this.state;

    this.setState({
      companySettings: companySettings.set('orgId', orgId)
    });
  };

  handleImsChange = (imsAccess) => {
    const { otherSettings } = this.state;

    this.setState({
      otherSettings: otherSettings.setIn(['tokens', 'imsAccess'], imsAccess)
    });
  };

  handleSave = () => {
    const { history, saveCompanySettings, saveOtherSettings } = this.props;
    const { otherSettings, companySettings } = this.state;

    if (!this.isValid()) {
      return false;
    }

    saveCompanySettings(companySettings);
    saveOtherSettings(otherSettings);
    history.push(NAMED_ROUTES.LIBRARY_EDITOR);

    return true;
  };

  isValid() {
    const errors = {};
    const { companySettings, otherSettings } = this.state;

    if (!companySettings.get('orgId')) {
      errors.orgId = true;
    }

    if (!otherSettings.getIn(['tokens', 'imsAccess'])) {
      errors.imsAccess = true;
    }

    this.setState({ errors });
    return Object.keys(errors).length === 0;
  }

  render() {
    const { errors, otherSettings, companySettings } = this.state;

    return (
      <Flex direction="column">
        <View width="100%" alignSelf="center">
          <Heading level={2}>Company Settings</Heading>
          <Divider />
          <Flex direction="column" alignItems="center">
            <TextField
              label="Organization ID"
              necessityIndicator="label"
              isRequired
              width="size-6000"
              marginTop="size-150"
              validationState={errors.orgId ? 'invalid' : ''}
              value={companySettings.get('orgId')}
              onChange={this.handleOrgIdChange}
            />
          </Flex>

          <Heading level={2} marginTop="size-400">
            IMS Token Settings
          </Heading>
          <Divider />
          <Flex direction="column" alignItems="center">
            <View>
              <TextField
                label="IMS Token"
                necessityIndicator="label"
                isRequired
                width="size-6000"
                marginTop="size-150"
                validationState={errors.imsAccess ? 'invalid' : ''}
                value={otherSettings.getIn(['tokens', 'imsAccess'])}
                onChange={this.handleImsChange}
              />
              <br />

              <Button variant="cta" marginTop="size-400" onPress={this.handleSave}>
                Save
              </Button>
            </View>
          </Flex>
        </View>
      </Flex>
    );
  }
}

const mapState = (state) => ({
  companySettings: state.company,
  otherSettings: state.otherSettings
});

const mapDispatch = ({
  otherSettings: { saveOtherSettings },
  company: { saveCompanySettings }
}) => ({
  saveCompanySettings: (payload) => saveCompanySettings(payload),
  saveOtherSettings: (payload) => saveOtherSettings(payload)
});

export default withRouter(connect(mapState, mapDispatch)(OtherSettings));
