import React from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';

import './Button.css';

function Button({
  onClick, children, className, compact, basic, primary, secondary,  fluid, disabled = undefined,
}) {
  const classNames = cx('Button', className, {
    'Button-primary': primary,
    'Button-secondary': secondary,
    'Button-fluid': fluid,
    'Button-disabled': disabled,
    'Button-basic': basic,
    'Button-compact': compact
  });

  return (
    <button onClick={onClick} className={classNames} disabled={disabled}>
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
};

Button.propTypes = {
  onClick: PropTypes.func.isRequired,
  children: PropTypes.string.isRequired,
  basic: PropTypes.bool,
  primary: PropTypes.bool,
  secondary: PropTypes.bool,
  disabled: PropTypes.bool,
  fluid: PropTypes.bool,
};

export default Button;
