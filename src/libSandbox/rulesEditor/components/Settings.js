import React from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import OtherSettings from './OtherSettings';

const Main = ({ brain, orgId, imsAccess, loadContainerData, clearContainerData }) => (
  <div>
    <OtherSettings key={`${orgId}${imsAccess}`} />
    <div className="main-container">
      <p>The data used inside this editor is loaded from `localStorage`.</p>
      <p>
        If you want to overwrite the current data with the one stored inside the{' '}
        <strong>`.sandbox/container.js`</strong> file click on the `Import data` button.
        <button
          type="button"
          className="pure-button pure-button-primary"
          onClick={loadContainerData}
        >
          Import data
        </button>
        {brain.get('containerDataLoaded') != null ? (
          <span className={`status-${brain.get('containerDataLoaded')}`}>
            <br />
            Last import status: <strong>{brain.get('containerDataLoaded')}</strong>.
          </span>
        ) : null}
        {}
      </p>
      <p>
        If you want to reset current data click on the `Reset data` button.
        <button
          type="button"
          className="pure-button pure-button-primary"
          onClick={clearContainerData}
        >
          Reset data
        </button>
        {brain.get('containerDataReseted') != null ? (
          <span className={`status-${brain.get('containerDataReseted')}`}>
            <br />
            Last reset status: <strong>{brain.get('containerDataReseted')}</strong>.
          </span>
        ) : null}
      </p>
    </div>
  </div>
);

const mapState = (state) => ({
  brain: state.brain,
  orgId: state.otherSettings.getIn(['company', 'orgId']),
  imsAccess: state.otherSettings.getIn(['tokens', 'imsAccess'])
});

const mapDispatch = ({ brain: { loadContainerData, clearContainerData } }) => ({
  loadContainerData: () => loadContainerData(),
  clearContainerData: () => clearContainerData()
});

export default withRouter(connect(mapState, mapDispatch)(Main));
