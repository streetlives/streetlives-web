import React from 'react';

const LoadingLabel = ({ children }) => (
  <p>
    <i className="fa fa-spinner fa-spin" aria-hidden="true" style={{ paddingTop: '30vh' }} />&nbsp;
    { (children || <span>Loading location data</span>) }
    ...{' '}
  </p>
);

export default LoadingLabel;
