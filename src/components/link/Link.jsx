import React from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import './Link.css';

function Link({ onClick, children, className }) {
  const classNames = cx('Link', className);

  return (
    <button
      className={classNames}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

Link.propTypes = {
  onClick: PropTypes.func.isRequired,
  children: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  className: PropTypes.string,
};

Link.defaultProps = {
  className: '',
};

export default Link;
