import React from 'react';
import PropTypes from 'prop-types';

import './Badge.css';

function Badge({ children }) {
  return <div className="Badge d-flex align-items-center rounded px-2 py-1">{children}</div>;
}

Badge.propTypes = {
  children: PropTypes.string.isRequired,
};

export default Badge;
