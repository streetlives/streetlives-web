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
  const classNames = cx(circle ? {} : className, {
    Icon: true,
    'fa-lg': size === 'lg',
    'fa-2x': size === '2x',
    'fa-3x': size === '3x',
    fa: !custom,
    [`fa-${name}`]: !custom,
  });

  const containerClassNames = cx(circle ? className : {}, {
    'Icon-container': true,
    circle,
  });

  const iconProps = {
    onClick,
    style,
    className: classNames,
  };

  const icon = custom ?
    <img {...iconProps} alt={alt} src={`/icons/${name}.svg`} /> :
    <i {...iconProps} alt={alt} />;

  if (!circle) {
    return icon;
  }

  return (
    <div className={containerClassNames}>
      {icon}
    </div>
  );
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
