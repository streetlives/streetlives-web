import React from 'react';
import cx from 'classnames';

import './ListeningIndicator.css';

const ListeningIndicator = ({ className }) => (
  <div className={cx('ListeningIndicator', className)}>
    <div className="ring" />
    <div className="dot" />
  </div>
);

export default ListeningIndicator;
