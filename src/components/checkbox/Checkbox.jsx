import React from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';

import './Checkbox.css';

function Checkbox({
  name,
  label,
  checked,
  onChange,
  className,
  disabled = undefined,
}) {
  const classNames = cx('Checkbox', className, {
    'Checkbox-disabled': disabled,
  });
  const id = `${name}-checkbox`;

  return (
    <div className={classNames}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={event => onChange(event.target.checked)}
        disabled={disabled}
        className="Box"
      />
      <label className="Label" htmlFor={id}>{label}</label>
    </div>
  );
}

Checkbox.defaultProps = {
  disabled: false,
  className: '',
};

Checkbox.propTypes = {
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
  checked: PropTypes.bool,
  disabled: PropTypes.bool,
};

export default Checkbox;
