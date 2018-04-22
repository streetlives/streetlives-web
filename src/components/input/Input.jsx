import React from 'react';
import cx from 'classnames';
import './Input.css';

function Input({ type = 'text', fluid, placeholder, name, onChange, defaultValue, value, size }) {
  const classNames = cx('Input', {
    'Input-fluid': fluid,
  });

  return (
    <input
      value={value}
      className={classNames}
      type={type}
      placeholder={placeholder}
      name={name}
      onChange={onChange}
      defaultValue={defaultValue}
      size={size}
    />
  );
}

export default Input;
