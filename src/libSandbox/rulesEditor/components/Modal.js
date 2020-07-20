/* eslint-disable jsx-a11y/control-has-associated-label */

import React from 'react';
import './Modal.css';

export default ({ show, title, children, onSave, onClose }) =>
  show ? (
    <div className="backdrop">
      <div className="modal">
        <div className="header">
          <div className="title">{title}</div>
          <button type="button" onClick={onClose} title="Delete" className="icono-cross" />
        </div>
        {children}
        <div className="footer">
          <button type="button" className="pure-button-primary pure-button" onClick={onSave}>
            Save
          </button>
          &nbsp;
          <button type="button" className="pure-button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  ) : null;
