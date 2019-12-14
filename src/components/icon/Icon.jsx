import React from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import './Icon.css';

function Icon({
  name,
  size,
  circle,
  onClick,
  className,
  style,
}) {
  const classNames = cx(`fa fa-${name}`, className, {
    Icon: true,
    'fa-lg': size === 'lg',
    'fa-2x': size === '2x',
    'fa-3x': size === '3x',
    circle,
  });

  return <i onClick={onClick} className={classNames} style={style} />;
}

Icon.propTypes = {
  name: PropTypes.string.isRequired,
  size: PropTypes.string,
  circle: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string,
};

Icon.defaultProps = {
  size: '',
  className: '',
  circle: false,
};

export default Icon;
