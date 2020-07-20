/* eslint-disable jsx-a11y/label-has-associated-control */

import React, { Component } from 'react';
import { List } from 'immutable';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import './PropertySettings.css';
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

  handleDomainsChange(event) {
    const { propertySettings } = this.state;

    this.setState({
      propertySettings: propertySettings.set('domains', event.target.value)
    });
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

  render() {
    const { errors, propertySettings } = this.state;
    return (
      <div className="property-settings-container">
        <form className="pure-form pure-form-aligned">
          <fieldset>
            <legend>Property Settings</legend>
            <div className="pure-control-group">
              <label htmlFor="domainsList">Domains List</label>
              <input
                className={`pure-input-1-3 ${errors.domains ? 'border-error' : ''}`}
                id="domainsList"
                type="text"
                value={propertySettings.get('domains') || ''}
                onChange={this.handleDomainsChange.bind(this)}
              />
              <span className="pure-form-message-inline">Comma separated values are accepted.</span>
            </div>
            <div className="pure-controls">
              <button
                type="button"
                className="pure-button pure-button-primary"
                onClick={this.handleSave.bind(this)}
              >
                Save
              </button>
            </div>
          </fieldset>
        </form>
      </div>
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
