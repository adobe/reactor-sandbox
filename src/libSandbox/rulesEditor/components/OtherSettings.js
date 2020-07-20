/* eslint-disable jsx-a11y/label-has-associated-control */

import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import basePath from '../helpers/basePath';

import './OtherSettings.css';

class OtherSettings extends Component {
  constructor(props) {
    super(props);

    this.state = {
      otherSettings: props.otherSettings,
      errors: {}
    };
  }

  handleOrgIdChange = (event) => {
    const { otherSettings } = this.state;

    this.setState({
      otherSettings: otherSettings.setIn(['company', 'orgId'], event.target.value)
    });
  };

  handleImsChange = (event) => {
    const { otherSettings } = this.state;

    this.setState({
      otherSettings: otherSettings.setIn(['tokens', 'imsAccess'], event.target.value)
    });
  };

  handleSave = () => {
    const { history, setOtherSettings } = this.props;
    const { otherSettings } = this.state;

    if (!this.isValid()) {
      return false;
    }

    setOtherSettings(otherSettings);
    history.push(basePath);

    return true;
  };

  isValid() {
    const errors = {};
    const { otherSettings } = this.state;

    if (!otherSettings.getIn(['company', 'orgId'])) {
      errors.orgId = true;
    }

    if (!otherSettings.getIn(['tokens', 'imsAccess'])) {
      errors.imsAccess = true;
    }

    this.setState({ errors });
    return Object.keys(errors).length === 0;
  }

  render() {
    const { errors, otherSettings } = this.state;

    return (
      <div className="other-settings-container">
        <form className="pure-form pure-form-aligned">
          <fieldset>
            <legend>Company Settings</legend>
            <div className="pure-control-group">
              <label htmlFor="orgId">Organization ID</label>
              <input
                className={`pure-input-2-3 ${errors.orgId ? 'border-error' : ''}`}
                id="orgId"
                type="text"
                value={otherSettings.getIn(['company', 'orgId']) || ''}
                onChange={this.handleOrgIdChange}
              />
            </div>
          </fieldset>

          <fieldset>
            <legend>Tokens</legend>
            <div className="pure-control-group">
              <label htmlFor="imsAccess">IMS Token</label>
              <input
                className={`pure-input-2-3 ${errors.imsAccess ? 'border-error' : ''}`}
                id="imsAccess"
                type="text"
                value={otherSettings.getIn(['tokens', 'imsAccess']) || ''}
                onChange={this.handleImsChange}
              />
            </div>
            <div className="pure-controls">
              <button
                type="button"
                className="pure-button pure-button-primary"
                onClick={this.handleSave}
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
  otherSettings: state.otherSettings
});

const mapDispatch = ({ otherSettings: { setOtherSettings } }) => ({
  setOtherSettings: (payload) => setOtherSettings(payload)
});

export default withRouter(connect(mapState, mapDispatch)(OtherSettings));
