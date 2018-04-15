import React from 'react';
import cx from 'classnames';
import './Input.css';

function Input({ type = 'text', fluid, placeholder, name, onChange, defaultValue }) {
  const classNames = cx('Input', {
    'Input-fluid': fluid,
  });

  return (
    <input
      className={classNames}
      type={type}
      placeholder={placeholder}
      name={name}
      onChange={onChange}
      defaultValue={defaultValue}
    />
  );
}

export default Input;
