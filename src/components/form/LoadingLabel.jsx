import React from 'react';
import Icon from '../icon';

const LoadingLabel = ({ children }) => (
  <p>
    <Icon name="spinner" spin aria-hidden="true" />&nbsp;
    { (children || <span>Loading location data</span>) }
    ...{' '}
  </p>
);

export default LoadingLabel;
