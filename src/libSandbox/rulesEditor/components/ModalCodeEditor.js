import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Map } from 'immutable';
import Modal from './Modal';
import './ModalCodeEditor.css';

class ModalCodeEditor extends Component {
  constructor(props) {
    super(props);

    this.state = {
      codeEditorModal: Map(),
      prevModalSize: props.modals.size
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.modals.size !== prevState.prevModalSize) {
      return {
        prevModalSize: nextProps.modals.size,
        codeEditorModal: nextProps.modals.getIn(['codeEditorModal'])
      };
    }

    return null;
  }

  handleOnSave = () => {
    const { codeEditorModal } = this.state;
    const { closeCodeEditorModal } = this.props;

    codeEditorModal.get('onSave')(codeEditorModal.get('code'));
    closeCodeEditorModal();
  };

  handleOnClose = () => {
    const { codeEditorModal } = this.state;
    const { closeCodeEditorModal } = this.props;

    codeEditorModal.get('onClose')();
    closeCodeEditorModal();
  };

  handleCodeChange = (event) => {
    const { codeEditorModal } = this.state;

    this.setState({
      codeEditorModal: codeEditorModal.set('code', event.target.value)
    });
  };

  render() {
    const { codeEditorModal } = this.state;

    return codeEditorModal ? (
      <div className="modal-code-editor">
        <Modal
          title="Code Editor"
          show={codeEditorModal.get('open')}
          onSave={this.handleOnSave}
          onClose={this.handleOnClose}
        >
          <div className="pure-form">
            <textarea value={codeEditorModal.get('code')} onChange={this.handleCodeChange} />
          </div>
        </Modal>
      </div>
    ) : null;
  }
}

const mapState = (state) => ({
  modals: state.modals
});

const mapDispatch = ({ modals: { closeCodeEditorModal } }) => ({
  closeCodeEditorModal: (payload) => closeCodeEditorModal(payload)
});

export default withRouter(connect(mapState, mapDispatch)(ModalCodeEditor));
