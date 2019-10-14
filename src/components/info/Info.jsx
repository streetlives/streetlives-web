import React from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import { ReactComponent as InfoSvg } from './info.svg';
import './Info.css';

function Icon({
  onClick,
  solid,
  size,
  className,
}) {
  const classNames = cx('Info', className, {
    'Info-solid': solid,
    'Info-large': size === 'large',
    'Info-medium': size === 'medium',
    'Info-small': size === 'small',
  });

  return (
    <InfoSvg
      className={classNames}
      onClick={onClick}
    />
  );
}

Icon.propTypes = {
  onClick: PropTypes.func,
  solid: PropTypes.bool,
  size: PropTypes.string,
  className: PropTypes.string,
};

Icon.defaultProps = {
  className: '',
  solid: false,
  size: 'medium',
};

export default Icon;
