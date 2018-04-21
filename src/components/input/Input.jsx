import React from 'react';
import cx from 'classnames';
import './Input.css';

function Input({ type = 'text', fluid, placeholder, name, onChange, defaultValue, style, value }) {
  const classNames = cx('Input', {
    'Input-fluid': fluid,
  });

  return (
    <input
      value={value}
      style={style}
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
