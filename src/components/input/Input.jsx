import React from 'react';
import cx from 'classnames';
import './Input.css';

function Input({ type = 'text', fluid, placeholder, name, onChange }){
  const classNames = cx('Input', {
    'Input-fluid': fluid,
  });

  return <input className={classNames} type={type} placeholder={placeholder} name={name} onChange={onChange}/>;
}

export default Input;
