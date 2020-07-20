/* eslint-disable jsx-a11y/control-has-associated-label */

import React from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import './RuleComponentCard.css';
import basePath from '../helpers/basePath';

const cardDetails = (item, type, registry) => {
  const component = registry.getIn(['components', type, item.get('modulePath')]);
  return (
    <div>
      <div className="card-display-name" title={component.get('displayName')}>
        {component.get('displayName')}
      </div>
      <div className="card-extension-display-name" title={component.get('extensionDisplayName')}>
        {component.get('extensionDisplayName')}
      </div>
    </div>
  );
};

const RuleComponentCard = ({ item, match, type, index, registry, handleDeleteClick }) => (
  <div className="rule-component-card" title={item.get('modulePath')}>
    {cardDetails(item, type, registry)}

    <Link to={`${basePath}/rules/${match.params.rule_id}/${type}/${index}`}>
      <div title="Edit" className="icono-file" />
    </Link>

    <button
      type="button"
      onClick={handleDeleteClick.bind(this, type, index)}
      title="Delete"
      className="icono-cross"
    />
  </div>
);

const mapState = (state) => {
  return {
    registry: state.registry
  };
};

const mapDispatch = () => ({});

export default withRouter(connect(mapState, mapDispatch)(RuleComponentCard));
