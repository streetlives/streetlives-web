import React from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';

import './Button.css';

function Button({
  onClick, children, basic, primary, secondary, disabled, fluid,
}) {
  const classNames = cx('Button', {
    'Button-primary': primary,
    'Button-secondary': secondary,
    'Button-fluid': fluid,
    'Button-disabled': disabled,
    'Button-basic': basic,
  });

  return (
    <button onClick={onClick} className={classNames} disabled={disabled || undefined}>
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
  children: PropTypes.element.isRequired,
  basic: PropTypes.bool,
  primary: PropTypes.bool,
  secondary: PropTypes.bool,
  disabled: PropTypes.bool,
  fluid: PropTypes.bool,
};

export default Button;
