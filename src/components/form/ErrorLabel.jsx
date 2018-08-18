import React from 'react';
import './ErrorLabel.css'

const ErrorLabel = ({ errorMessage }) => (
  <div className="FormEdit">
    <p>
      <i className="fas fa-exclamation-triangle" aria-hidden="true" />&nbsp;
      <span>{errorMessage}</span>
    </p>
    <p onClick={() => {window.location.reload()}}> Click here to reload the page </p>
  </div>
);

export default ErrorLabel;
