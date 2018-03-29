import React from 'react';
import cx from 'classnames';
import './Button.css';

function Button() {
  const {
    onClick, children, basic, primary, secondary, disabled, fluid,
  } = this.props;
  const classNames = cx('Button', {
    'Button-primary': primary,
    'Button-secondary': secondary,
    'Button-fluid': fluid,
    'Button-disabled': disabled,
    'Button-basic': basic,
  });

  return (
    <button onClick={onClick} className={classNames} disabled>
      {children}
    </button>
  );
}

export default Button;
