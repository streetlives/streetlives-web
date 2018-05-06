import React from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';

import './Button.css';

function Button({
  onClick,
  children,
  className,
  compact,
  basic,
  primary,
  secondary,
  fluid,
  half,
  disabled = undefined,
  color = undefined,
}) {
  const classNames = cx('Button', className, {
    'Button-primary': primary,
    'Button-secondary': secondary,
    'Button-fluid': fluid,
    'Button-disabled': disabled,
    'Button-basic': basic,
    'Button-compact': compact,
    'Button-half': half,
  });

  return (
    <button onClick={onClick} className={classNames} disabled={disabled} style={{ color: color}}>
      {children}
    </button>
  );
}

Button.defaultProps = {
  basic: false,
  primary: false,
  secondary: false,
  disabled: false,
  fluid: false,
  className: '',
  compact: false,
  half: false,
};

Button.propTypes = {
  onClick: PropTypes.func.isRequired,
  children: PropTypes.oneOfType([PropTypes.string, PropTypes.element]).isRequired,
  className: PropTypes.string,
  basic: PropTypes.bool,
  compact: PropTypes.bool,
  primary: PropTypes.bool,
  secondary: PropTypes.bool,
  disabled: PropTypes.bool,
  fluid: PropTypes.bool,
  half: PropTypes.bool,
};

export default Button;
