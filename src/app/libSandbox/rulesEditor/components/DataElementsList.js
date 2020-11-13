import React from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import List from './List';

const DataElementsList = ({ dataElements, deleteDataElement }) => (
  <List
    items={dataElements}
    nameProperty="name"
    deleteFn={deleteDataElement}
    linkPrefix="/data_elements"
    className="data-elements-list"
  />
);

const mapState = (state) => ({
  dataElements: state.dataElements
});

const mapDispatch = ({ dataElements: { deleteDataElement } }) => ({
  deleteDataElement: (i) => deleteDataElement(i)
});

export default withRouter(connect(mapState, mapDispatch)(DataElementsList));
