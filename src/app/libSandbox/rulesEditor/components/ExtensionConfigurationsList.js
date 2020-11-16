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
    heading="Extension Configurations"
  />
);

const mapState = (state) => ({
  extensionConfigurations: state.extensionConfigurations
});

const mapDispatch = ({ extensionConfigurations: { deleteExtensionConfiguration } }) => ({
  deleteExtensionConfiguration: (i) => deleteExtensionConfiguration(i)
});

export default withRouter(connect(mapState, mapDispatch)(ExtensionConfigurationsList));
