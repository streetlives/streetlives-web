import React from 'react';
import cx from 'classnames';

import Icon from '../../icon';
import './Option.css';

function Option({
  active, align = 'left', children, onClick, disabled,
}) {
  const classNames = cx('Option d-flex justify-content-between align-items-center', {
    'Option-active': active,
    'Option-disabled': disabled,
    'text-left': align === 'left',
    'text-center': align === 'center',
  });
  return (
    <button className={classNames} onClick={!disabled ? onClick : () => {}} disabled={disabled}>
      <div className="w-100">{children}</div>
      {active && <Icon name="check" />}
    </button>
  );
}

export default Option;
