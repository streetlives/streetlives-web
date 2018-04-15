import React from 'react';
import PropTypes from 'prop-types';

function Badge({ children }) {
  return (
    <small className="bg-dark text-light rounded text-left font-weight-light p-1">{children}</small>
  );
}

Badge.propTypes = {
  children: PropTypes.string.isRequired,
};

export default Badge;
