import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import {
  Dialog,
  DialogContainer,
  Heading,
  Content,
  ButtonGroup,
  Button,
  TextArea,
  Divider
} from '@adobe/react-spectrum';
import { Map } from 'immutable';

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

  handleCodeChange = (code) => {
    const { codeEditorModal } = this.state;

    this.setState({
      codeEditorModal: codeEditorModal.set('code', code)
    });
  };

  render() {
    const { codeEditorModal } = this.state;

    return codeEditorModal && codeEditorModal.get('open') ? (
      <>
        <DialogContainer>
          <Dialog>
            <Heading>Code Editor</Heading>
            <Divider />
            <Content>
              <TextArea
                UNSAFE_className="codeEditorTextArea"
                label="Code"
                width="100%"
                autoComplete="off"
                value={codeEditorModal.get('code')}
                onChange={this.handleCodeChange}
              />
            </Content>
            <ButtonGroup>
              <Button variant="secondary" onPress={this.handleOnClose}>
                Cancel
              </Button>
              <Button variant="cta" onPress={this.handleOnSave}>
                Save
              </Button>
            </ButtonGroup>
          </Dialog>
        </DialogContainer>
      </>
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
