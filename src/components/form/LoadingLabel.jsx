import React from 'react';

const LoadingLabel = ({ children }) => (
  <p>
    <i className="fa fa-spinner fa-spin" aria-hidden="true" />&nbsp;
    { (children || <span>Loading location data</span>) }
    ...{' '}
  </p>
);

export default LoadingLabel;
