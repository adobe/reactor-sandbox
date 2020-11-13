import React from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import List from './List';

const RulesList = ({ rules, deleteRule }) => (
  <List
    items={rules}
    nameProperty="name"
    deleteFn={deleteRule}
    linkPrefix="/rules"
    className="rules-list"
  />
);

const mapState = (state) => ({
  rules: state.rules
});

const mapDispatch = ({ rules: { deleteRule } }) => ({
  deleteRule: (i) => deleteRule(i)
});

export default withRouter(connect(mapState, mapDispatch)(RulesList));
