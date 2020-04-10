import React from 'react';
import cx from 'classnames';
import Textarea from 'react-textarea-autosize';
import './TextArea.css';

function TextArea({
  fluid,
  rounded,
  placeholder,
  minRows,
  maxRows,
  onChange,
  autoFocus,
  value,
  defaultValue,
  className,
}) {
  const classNames = cx('TextArea', className, {
    'TextArea-fluid': fluid,
    'TextArea-rounded': rounded,
  });

  return (
    <Textarea
      className={classNames}
      placeholder={placeholder}
      minRows={minRows}
      maxRows={maxRows}
      autoFocus={autoFocus}
      value={value}
      defaultValue={defaultValue}
      onChange={onChange}
    />
  );
}

export default TextArea;
