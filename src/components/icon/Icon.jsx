import React from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './Icon.css';

function Icon({
  name,
  custom,
  alt,
  size,
  circle,
  spin,
  onClick,
  className,
  style,
}) {
  const classNames = cx(circle ? {} : className, {
    Icon: true,
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
    <FontAwesomeIcon {...iconProps} size={size} icon={name} alt={alt} spin={spin} />;

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
  className: '',
  custom: false,
  circle: false,
};

export default Icon;
