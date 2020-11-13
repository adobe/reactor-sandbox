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
