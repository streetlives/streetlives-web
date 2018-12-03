import React from 'react';
import cx from 'classnames';
import Textarea from 'react-textarea-autosize';
import './TextArea.css';

function TextArea({
  fluid,
  placeholder,
  minRows,
  maxRows,
  onChange,
  value,
  className,
}) {
  const classNames = cx('TextArea', className, {
    'TextArea-fluid': fluid,
  });

  return (
    <Textarea
      className={classNames}
      placeholder={placeholder}
      minRows={minRows}
      maxRows={maxRows}
      value={value}
      onChange={onChange}
    />
  );
}

export default TextArea;
