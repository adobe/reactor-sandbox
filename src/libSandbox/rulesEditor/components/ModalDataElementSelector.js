import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Map, List } from 'immutable';
import Modal from './Modal';
import './ModalDataElementSelector.css';

class ModalDataElementSelectorEditor extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dataElementSelectorModal: Map(),
      prevModalSize: props.modals.size
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.modals.size !== prevState.prevModalSize) {
      return {
        prevModalSize: nextProps.modals.size,
        dataElementSelectorModal: nextProps.modals.getIn(['dataElementSelectorModal'])
      };
    }

    return null;
  }

  handleOnSave = () => {
    const { dataElementSelectorModal } = this.state;
    const { closeDataElementSelectorModal } = this.props;

    let newDataElement = '';
    if (dataElementSelectorModal.get('dataElement')) {
      newDataElement = `%${dataElementSelectorModal.get('dataElement')}%`;
    }

    dataElementSelectorModal.get('onSave')(newDataElement);
    closeDataElementSelectorModal();
  };

  handleOnClose = () => {
    const { dataElementSelectorModal } = this.state;
    const { closeDataElementSelectorModal } = this.props;

    dataElementSelectorModal.get('onClose')();
    closeDataElementSelectorModal();
  };

  handleDataElementChange = (event) => {
    const { dataElementSelectorModal } = this.state;

    this.setState({
      dataElementSelectorModal: dataElementSelectorModal.set('dataElement', event.target.value)
    });
  };

  dataElementList() {
    const { dataElements } = this.props;
    return (dataElements || List()).valueSeq().map((v) => (
      <option value={v.get('name')} key={`extensionConfiguration${v.get('name')}`}>
        {v.get('name')}
      </option>
    ));
  }

  render() {
    const { dataElementSelectorModal } = this.state;

    return dataElementSelectorModal ? (
      <div className="modal-data-element-selector pure-form">
        <Modal
          title="Data Element Selector"
          show={dataElementSelectorModal.get('open')}
          onSave={this.handleOnSave}
          onClose={this.handleOnClose}
        >
          <select
            value={dataElementSelectorModal.get('dataElement')}
            onChange={this.handleDataElementChange}
          >
            <option>Please select...</option>
            {this.dataElementList()}
          </select>
        </Modal>
      </div>
    ) : null;
  }
}

const mapState = (state) => ({
  modals: state.modals,
  dataElements: state.dataElements
});

const mapDispatch = ({ modals: { closeDataElementSelectorModal } }) => ({
  closeDataElementSelectorModal: (payload) => closeDataElementSelectorModal(payload)
});

export default withRouter(connect(mapState, mapDispatch)(ModalDataElementSelectorEditor));
