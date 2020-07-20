import React from 'react';
import './Backdrop.css';

export default ({ message }) => (
  <div className="backdrop backdrop-only pure-u-1-1">
    <div className="lds-ring">
      <div />
      <div />
      <div />
      <div />
    </div>
    {message}
  </div>
);
