import React from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import './Icon.css';

function Icon({ name, size, className }) {
  const classNames = cx(`fa fa-${name} Icon-${name}`, className, {
    Icon: true,
    'fa-lg': size === 'lg',
    'fa-2x': size === '2x',
    'fa-3x': size === '3x',
  });

  return <i className={classNames} />;
}

Icon.propTypes = {
  name: PropTypes.string.isRequired,
  size: PropTypes.string,
  className: PropTypes.string,
};

Icon.defaultProps = {
  size: '',
  className: '',
};

export default Icon;
