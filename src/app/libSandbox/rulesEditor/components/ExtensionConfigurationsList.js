import React from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import List from './List';

const ExtensionConfigurationsList = ({ extensionConfigurations, deleteExtensionConfiguration }) => (
  <List
    items={extensionConfigurations}
    nameProperty="displayName"
    deleteFn={deleteExtensionConfiguration}
    linkPrefix="/extension_configurations"
    className="extension-configurations-list"
  />
);

const mapState = (state) => ({
  extensionConfigurations: state.extensionConfigurations
});

const mapDispatch = ({ extensionConfigurations: { deleteExtensionConfiguration } }) => ({
  deleteExtensionConfiguration: (i) => deleteExtensionConfiguration(i)
});

export default withRouter(connect(mapState, mapDispatch)(ExtensionConfigurationsList));
