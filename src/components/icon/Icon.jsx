import React from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import './Icon.css';

function Icon({
  name,
  custom,
  alt,
  size,
  circle,
  onClick,
  className,
  style,
}) {
  const classNames = cx(className, {
    Icon: true,
    'fa-lg': size === 'lg',
    'fa-2x': size === '2x',
    'fa-3x': size === '3x',
    fa: !custom,
    [`fa-${name}`]: !custom,
    circle,
  });

  const props = {
    onClick,
    style,
    className: classNames,
  };

  if (custom) {
    return <img {...props} alt={alt} src={`/icons/${name}.svg`} />;
  }

  return <i {...props} alt={alt} />;
}

Icon.propTypes = {
  name: PropTypes.string.isRequired,
  custom: PropTypes.bool,
  size: PropTypes.string,
  circle: PropTypes.bool,
  alt: PropTypes.string,
  onClick: PropTypes.func,
  className: PropTypes.string,
};

Icon.defaultProps = {
  size: '',
  className: '',
  custom: false,
  circle: false,
};

export default Icon;
