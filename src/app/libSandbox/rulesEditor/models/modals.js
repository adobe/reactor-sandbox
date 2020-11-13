import { fromJS, Map } from 'immutable';

export default {
  state: Map(), // initial state
  reducers: {
    openCodeEditorModal(state, payload) {
      return state.merge(
        fromJS({
          codeEditorModal: {
            open: true,
            code: payload.code,
            onSave: payload.onSave,
            onClose: payload.onClose
          }
        })
      );
    },

    closeCodeEditorModal(state) {
      return state.delete('codeEditorModal');
    },

    openDataElementSelectorModal(state, payload) {
      return state.merge(
        fromJS({
          dataElementSelectorModal: {
            open: true,
            onSave: payload.onSave,
            onClose: payload.onClose
          }
        })
      );
    },

    closeDataElementSelectorModal(state) {
      return state.delete('dataElementSelectorModal');
    }
  }
};
